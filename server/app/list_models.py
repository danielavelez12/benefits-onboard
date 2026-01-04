"""
Utility script to list available Gemini models.
Run this to see which models are available with your API key.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY environment variable is not set")
    exit(1)

genai.configure(api_key=api_key)

print("Fetching available models...")
print("=" * 60)

try:
    models = list(genai.list_models())
    print(f"\nFound {len(models)} available models:\n")
    
    # Filter for models that support generateContent
    generate_content_models = [
        m for m in models 
        if 'generateContent' in m.supported_generation_methods
    ]
    
    print(f"Models supporting generateContent: {len(generate_content_models)}\n")
    
    for model in generate_content_models:
        model_name = model.name.split('/')[-1] if '/' in model.name else model.name
        print(f"✓ {model_name}")
        if hasattr(model, 'display_name') and model.display_name:
            print(f"  Display: {model.display_name}")
        print()
except Exception as e:
    print(f"Error listing models: {e}")
    print("\nTrying common model names manually...")
    
    # Try common model names
    common_models = [
        "gemini-pro",
        "gemini-pro-vision",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-2.0-flash-exp",
        "gemini-3-pro",
    ]
    
    for model_name in common_models:
        try:
            model = genai.GenerativeModel(model_name)
            print(f"✓ {model_name} is available")
        except Exception as err:
            print(f"✗ {model_name} is not available: {err}")

