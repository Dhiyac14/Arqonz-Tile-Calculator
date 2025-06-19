from flask import Flask, request, jsonify, send_from_directory
import os
from dotenv import load_dotenv
import google.generativeai as genai
import math
import re # Import re for regular expressions
from enum import Enum

# Load environment variables from .env file
load_dotenv()

# Define conversation steps
class ConversationStep(Enum):
    INITIAL = 1
    ASK_TILE_TYPE = 2
    ASK_DIMENSIONS = 3
    ASK_TILE_SIZE = 4
    CALCULATED = 5

# Set the static folder to the React build directory
app = Flask(__name__)

# Get API key from environment variable
api_key = os.getenv('GOOGLE_API_KEY')

# Configure the Google Generative AI
genai.configure(api_key=api_key)

# Debug: Print API key status
print(f"API Key present: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"API Key length: {len(api_key)}")
    print(f"API Key first 4 chars: {api_key[:4]}")

# List available models (commented out to reduce console clutter)
# print("Available models:")
# for m in genai.list_models():
#     print(f"- {m.name}")

# Initialize the model - using the recommended model
model = genai.GenerativeModel('models/gemini-1.5-flash')

# In a real application, you'd use a proper session management or database
# to store conversation history per user. For this example, it's a simple dict.
# Each user's history will now include their current step and collected data
conversation_history = {}

def calculate_circular_area(diameter_ft):
    """Calculate area of a circle in square feet"""
    radius_ft = diameter_ft / 2
    return math.pi * (radius_ft ** 2)

def parse_area_input(input_str):
    """Parses area input like '100 Sq.Ft' or '9.29 Sq.M' or just numbers."""
    match_ft = re.search(r'(\d+\.?\d*)\s*(sq\.?\s*ft|feet|foot)', input_str, re.IGNORECASE)
    match_m = re.search(r'(\d+\.?\d*)\s*(sq\.?\s*m|meter|metre)', input_str, re.IGNORECASE)
    num_only = re.search(r'^\s*(\d+\.?\d*)\s*$', input_str)

    if match_ft:
        return float(match_ft.group(1)), 'Sq.Ft'
    elif match_m:
        return float(match_m.group(1)), 'Sq.M'
    elif num_only:
        return float(num_only.group(1)), None # Unit unknown, will ask later
    return None, None

def parse_dimensions_input(input_str):
    """Parses dimensions like '12x15 feet', '10 meters', 'diameter 15 ft'."""
    print(f"Debug: parse_dimensions_input received: '{input_str}'")
    # Example: '12x15 feet' or '12 by 15 ft' or '12 feet by 15 feet'
    match_lxw_ft = re.search(r'(\d+\.?\d*)\s*(?:feet|ft)?\s*(x|by)\s*(\d+\.?\d*)\s*(?:feet|ft)?', input_str, re.IGNORECASE)
    # Debugging the match object
    if match_lxw_ft:
        print(f"Debug: match_lxw_ft found: {match_lxw_ft.groups()}")
    else:
        print("Debug: match_lxw_ft did not find a match.")

    # Example: 'diameter 15 feet' or '15 ft diameter'
    match_diameter_ft = re.search(r'(diameter\s*)?(\d+\.?\d*)\s*(feet|ft)\s*(diameter)?', input_str, re.IGNORECASE)
    # Example: '10 feet' (single dimension for square)
    match_single_ft = re.search(r'^\s*(\d+\.?\d*)\s*(feet|ft)\s*$', input_str, re.IGNORECASE)

    if match_lxw_ft:
        return {'type': 'rectangle', 'length': float(match_lxw_ft.group(1)), 'width': float(match_lxw_ft.group(3)), 'unit': 'ft'}
    elif match_diameter_ft and (match_diameter_ft.group(1) or match_diameter_ft.group(4)):
        return {'type': 'circle', 'diameter': float(match_diameter_ft.group(2)), 'unit': 'ft'}
    elif match_single_ft:
        return {'type': 'square', 'side': float(match_single_ft.group(1)), 'unit': 'ft'}
    
    return None

def parse_tile_size_input(input_str):
    """Parses tile size input like '12x12 inches', '30x30 cm', '600x300 mm', etc. Always preserves parentheses and value if present."""
    print(f"Debug: parse_tile_size_input received: '{input_str}'")
    # If input contains parentheses with a value, return as-is
    if re.search(r'\(.*sq\.? ?ft.*\)', input_str, re.IGNORECASE):
        return input_str.strip()
    # Accept formats like 600x300 mm, 60x30 cm, 12x12 inches, 12x12 in, 30x30 cm, with or without spaces
    match = re.search(r'(\d+)\s*[xXby\*]\s*(\d+)\s*(mm|cm|inches|inch|in)?', input_str, re.IGNORECASE)
    if match:
        dim1 = match.group(1)
        dim2 = match.group(2)
        unit = match.group(3)
        if unit:
            unit = unit.lower()
            if unit in ['mm']:
                return f"{dim1}x{dim2} mm"
            elif unit in ['cm', 'centimeter', 'centimeters']:
                return f"{dim1}x{dim2} cm"
            elif unit in ['inches', 'inch', 'in']:
                return f"{dim1}x{dim2} inches"
        # If no unit, default to inches
        return f"{dim1}x{dim2} inches"
    print("Debug: No tile size match found.")
    return None

def calculate_tiles_needed(area_sqft, tile_size_str, pattern_type=None):
    """Calculate total number of tiles needed with buffer, considering tile unit conversion."""
    if not area_sqft or not tile_size_str:
        return None

    # First, check for area in parentheses (e.g., (1.94 sq.ft))
    area_match = re.search(r'\(\s*([\d\.]+)\s*sq\.? ?ft\s*\)', tile_size_str, re.IGNORECASE)
    if area_match:
        tile_area_sq_ft = float(area_match.group(1))
    else:
        # Extract dimensions and unit from tile_size_str
        tile_match = re.match(r'(\d+)(?:x|by)(\d+)\s*(inches|cm|mm)?', tile_size_str, re.IGNORECASE)
        if not tile_match:
            return None
        dim1 = float(tile_match.group(1))
        dim2 = float(tile_match.group(2))
        unit = tile_match.group(3).lower() if tile_match.group(3) else 'mm'  # Default to mm if not specified
        if unit == 'cm':
            # Convert cm to inches for calculation in sqft
            dim1 /= 2.54
            dim2 /= 2.54
            tile_area_sq_inches = dim1 * dim2
            tile_area_sq_ft = tile_area_sq_inches / 144  # 1 sq ft = 144 sq inches
        elif unit == 'inches' or unit == 'inch' or unit == 'in':
            tile_area_sq_inches = dim1 * dim2
            tile_area_sq_ft = tile_area_sq_inches / 144
        elif unit == 'mm':
            # Convert mm to sq.ft
            tile_area_sq_m = (dim1 / 1000) * (dim2 / 1000)
            tile_area_sq_ft = tile_area_sq_m * 10.7639
        else:
            return None

    if tile_area_sq_ft == 0:
        return None

    num_tiles = area_sqft / tile_area_sq_ft

    # Add buffer based on pattern type
    if pattern_type and 'checkerboard' in pattern_type.lower():
        buffer_percent = 0.15  # 15% buffer for checkerboard
    elif pattern_type and 'mosaic' in pattern_type.lower():
        buffer_percent = 0.20  # 20% buffer for mosaic
    else:
        buffer_percent = 0.10  # 10% buffer for standard
    
    total_tiles = math.ceil(num_tiles * (1 + buffer_percent))

    # Debug prints
    print(f"[DEBUG] area_sqft: {area_sqft}")
    print(f"[DEBUG] tile_area_sq_ft: {tile_area_sq_ft}")
    print(f"[DEBUG] num_tiles (before buffer): {num_tiles}")
    print(f"[DEBUG] total_tiles (after buffer & ceil): {total_tiles}")

    return total_tiles

@app.route('/')
def index():
    return jsonify({"message": "Flask API is running"})

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '').strip()
    user_id = "test_user" # In a real app, get this from user session/auth

    if user_id not in conversation_history:
        conversation_history[user_id] = {
            'step': ConversationStep.INITIAL,
            'data': {},
            'history': [] # Store {user_message, bot_reply, quick_replies} for full history
        }
    
    user_session = conversation_history[user_id]
    current_step = user_session['step']
    session_data = user_session['data']
    session_history = user_session['history']

    bot_reply = "I'm sorry, I didn't quite understand that. Can you rephrase?"
    quick_replies = []

    try:
        # Always add user message to session history for context in LLM
        session_history.append({'user_message': user_message})
        
        llm_context = "You are a helpful Tile Calculator Assistant. Your goal is to guide the user through a series of questions to calculate the number of tiles they need. Be concise and friendly. Only ask one question at a time. Do not anticipate future questions. Your next question must be based on the 'current_step' provided. For pattern calculations, suggest 15% waste for checkerboard and 20% for mosaic, otherwise 10% for general. Always confirm that the response is what the user expects. If the user mentions 'slip-resistant' or 'outdoor', acknowledge it and reassure them that you will keep it in mind for recommendations."

        # --- State Machine Logic ---
        if user_message.lower() == "start_conversation" or current_step == ConversationStep.INITIAL:
            bot_reply = "Hello! I'm your Tile Calculator chatbot. Are you looking for floor or wall tiles?"
            quick_replies = ["Floor", "Wall"]
            user_session['step'] = ConversationStep.ASK_TILE_TYPE
            print("Set step to ASK_TILE_TYPE")

        elif current_step == ConversationStep.ASK_TILE_TYPE:
            if "floor" in user_message.lower():
                session_data['tile_type'] = 'floor'
                bot_reply = "Great! What's the total surface area you need to cover? (e.g., 1500 Sq.Ft or 140 Sq.M)"
                quick_replies = []
                user_session['step'] = ConversationStep.ASK_DIMENSIONS
                print("Set step to ASK_DIMENSIONS")
            elif "wall" in user_message.lower():
                session_data['tile_type'] = 'wall'
                bot_reply = "Understood. What's the total surface area you need to cover? (e.g., 1500 Sq.Ft or 140 Sq.M)"
                quick_replies = []
                user_session['step'] = ConversationStep.ASK_DIMENSIONS
                print("Set step to ASK_DIMENSIONS")
            else:
                # Use LLM to clarify if the user's input implies floor/wall
                llm_prompt = f"{llm_context}\n\nUser has not specified floor or wall. Current conversation step: ASK_TILE_TYPE. User message: \"{user_message}\". Does this imply 'floor' or 'wall'? If not, re-ask clearly."
                llm_res = model.generate_content(llm_prompt)
                bot_reply = llm_res.text
                quick_replies = ["Floor", "Wall"]
                # Do not change step if unable to parse
        
        elif current_step == ConversationStep.ASK_DIMENSIONS:
            # Accept area input (e.g., 1500 Sq.Ft or 140 Sq.M)
            area_value, area_unit = parse_area_input(user_message)
            if area_value:
                # Convert Sq.M to Sq.Ft if needed
                if area_unit and area_unit.lower() in ['sq.m', 'sqm', 'sq.m.', 'sq meter', 'sq metre', 'meter', 'metre']:
                    area_sqft = area_value * 10.7639
                else:
                    area_sqft = area_value
                session_data['total_area_sqft'] = area_sqft
                bot_reply = f"Understood. The estimated area is {area_sqft:.2f} sq.ft. Now, what size of tile are you planning to use? (e.g., 1200x600 MM (7.75 sq.ft))"
                user_session['step'] = ConversationStep.ASK_TILE_SIZE
                print("Set step to ASK_TILE_SIZE")
            elif user_message.strip().lower() in ["don't know", "dont know", "not sure", "unknown", "i don't know", "idk"]:
                # Fallback: ask for dimensions
                bot_reply = "No problem! Please provide the length and width of the area in feet (e.g., '10 feet by 8 feet')."
                quick_replies = []
                # Do not change step, allow user to enter dimensions
            else:
                bot_reply = "Please enter the total surface area in Sq.Ft or Sq.M (e.g., 1500 Sq.Ft or 140 Sq.M)."
                quick_replies = []
                # Do not change step

        elif current_step == ConversationStep.ASK_TILE_SIZE:
            tile_size_str = parse_tile_size_input(user_message)
            if tile_size_str:
                session_data['tile_size'] = tile_size_str
                area_to_tile = session_data.get('total_area_sqft', 0) - session_data.get('excluded_area_sqft', 0)
                
                # Use standard 10% buffer since we're not asking for pattern type
                pattern_type = None
                
                total_tiles = calculate_tiles_needed(area_to_tile, tile_size_str, pattern_type)
                
                if total_tiles is not None:
                    # Also consider calculating boxes (4 tiles per box)
                    num_boxes = math.ceil(total_tiles / 4)
                    bot_reply = f"You will need approximately {total_tiles} tiles ({num_boxes} boxes). This includes a 10% buffer for wastage and design matching. Would you like to see tiles matching your selection?"
                    quick_replies = ["Yes, show tiles", "No, thanks"]
                    user_session['step'] = ConversationStep.CALCULATED
                    print("Set step to CALCULATED")
                else:
                    bot_reply = "I had trouble calculating the tiles with the provided information. Could you please re-enter the tile size or confirm the area?"
            else:
                bot_reply = "I couldn't understand the tile size. Please provide it in a format like '12x12 inches' or '30x30 cm'."

        elif current_step == ConversationStep.CALCULATED:
            if "yes" in user_message.lower() or "show tiles" in user_message.lower():
                bot_reply = "Great! Here are some tile products that might match your selection. (Scroll down to see them) Is there anything else I can help you with today?"
                quick_replies = ["Start New Calculation", "No, I'm done"]
            else:
                bot_reply = "Okay, no problem! Is there anything else I can help you with today?"
                quick_replies = ["Start New Calculation", "No, I'm done"]
            user_session['step'] = ConversationStep.INITIAL # Reset for new conversation
            print("Set step to INITIAL (reset)")
        
        # Update session history with bot reply and quick replies
        user_session['history'].append({'bot_message': bot_reply, 'quick_replies': quick_replies})

        print("Returning step:", user_session['step'])
        return {"reply": bot_reply, "quick_replies": quick_replies, "step": user_session['step'].value}

    except Exception as e:
        print(f"Detailed error in LLM response (state machine): {str(e)}")
        error_message = f"I apologize, but I'm having trouble processing your request. Error: {str(e)}"
        # Reset to initial step on critical error
        user_session['step'] = ConversationStep.INITIAL 
        user_session['data'] = {}
        user_session['history'] = []
        print("Set step to INITIAL (error reset)")
        return {"reply": error_message, "quick_replies": [], "step": ConversationStep.INITIAL.value}

if __name__ == '__main__':
    app.run(debug=True, port=5000) 