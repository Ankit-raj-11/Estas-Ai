import yaml
import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer


def load_config(config_path: str) -> dict:
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def format_prompt(example: dict) -> str:
    """Format the CodeAlpaca dataset into instruction format."""
    instruction = example.get("instruction", "")
    input_text = example.get("input", "")
    output = example.get("output", "")
    
    if input_text:
        prompt = f"### Instruction:\n{instruction}\n\n### Input:\n{input_text}\n\n### Response:\n{output}"
    else:
        prompt = f"### Instruction:\n{instruction}\n\n### Response:\n{output}"
    
    return prompt


def main():
    config = load_config("model.yaml")
    
    model_config = config["model"]
    data_config = config["data"]
    training_config = config["training"]
    peft_config = config["peft"]
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        model_config["model_name"],
        trust_remote_code=model_config["trust_remote_code"],
        model_max_length=model_config["model_max_length"],
    )
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    
    # Load model
    torch_dtype = getattr(torch, model_config["torch_dtype_str"])
    model = AutoModelForCausalLM.from_pretrained(
        model_config["model_name"],
        trust_remote_code=model_config["trust_remote_code"],
        torch_dtype=torch_dtype,
        device_map="auto",
    )
    model.config.use_cache = False
    
    # Configure LoRA
    if training_config.get("use_peft", False):
        lora_config = LoraConfig(
            r=peft_config["lora_r"],
            lora_alpha=peft_config["lora_alpha"],
            target_modules=peft_config["lora_target_modules"],
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM",
        )
        model = get_peft_model(model, lora_config)
        model.print_trainable_parameters()
    
    # Load dataset
    dataset_info = data_config["train"]["datasets"][0]
    dataset = load_dataset(dataset_info["dataset_name"], split=dataset_info["split"])
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=training_config["output_dir"],
        per_device_train_batch_size=training_config["per_device_train_batch_size"],
        gradient_accumulation_steps=training_config["gradient_accumulation_steps"],
        learning_rate=training_config["learning_rate"],
        max_steps=training_config["max_steps"],
        optim=training_config["optimizer"],
        seed=training_config["seed"],
        logging_steps=10,
        save_steps=100,
        save_total_limit=3,
        bf16=torch.cuda.is_bf16_supported(),
        fp16=not torch.cuda.is_bf16_supported(),
        gradient_checkpointing=True,
        report_to="none",
    )
    
    # Initialize trainer
    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        tokenizer=tokenizer,
        formatting_func=format_prompt,
        max_seq_length=model_config["model_max_length"],
        packing=False,
    )
    
    # Train
    trainer.train()
    
    # Save the model
    trainer.save_model(training_config["output_dir"])
    tokenizer.save_pretrained(training_config["output_dir"])
    print(f"Model saved to {training_config['output_dir']}")


if __name__ == "__main__":
    main()
