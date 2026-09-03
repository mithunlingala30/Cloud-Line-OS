"""
Run: python seed_simple_problems.py
Seeds 20 simple basic beginner problems into Firestore using the public REST API.
"""
import json
import urllib.request
import uuid

PROJECT_ID = "leetcod-cec3f"
FIRESTORE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/problems"

PROBLEMS = [
    {
        "title": "Sum to N",
        "slug": "sum-to-n",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given a number N, print the sum of all integers from 1 to N.\n\nExample:\nInput: 5\nOutput: 15",
        "starter_code": {"python": "n = int(input())\nprint(sum(range(1, n+1)))"},
        "testcases": [{"input": "5", "expected_output": "15"}, {"input": "10", "expected_output": "55"}],
    },
    {
        "title": "Max of Two",
        "slug": "max-of-two",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given two space-separated integers A and B, print the larger one.\n\nExample:\nInput: 15 20\nOutput: 20",
        "starter_code": {"python": "a, b = map(int, input().split())\nprint(max(a, b))"},
        "testcases": [{"input": "15 20", "expected_output": "20"}, {"input": "99 12", "expected_output": "99"}],
    },
    {
        "title": "Leap Year Check",
        "slug": "leap-year-check",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Check if a given year is a leap year (divisible by 4, but not by 100 unless also by 400).\nLine 1: integer year.\n\nExample:\nInput: 2000\nOutput: Yes",
        "starter_code": {"python": "y = int(input())\nis_leap = (y%4==0 and y%100!=0) or (y%400==0)\nprint('Yes' if is_leap else 'No')"},
        "testcases": [{"input": "2000", "expected_output": "Yes"}, {"input": "1900", "expected_output": "No"}],
    },
    {
        "title": "Square of Number",
        "slug": "square-of-number",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given an integer N, print its square.\n\nExample:\nInput: 5\nOutput: 25",
        "starter_code": {"python": "n = int(input())\nprint(n*n)"},
        "testcases": [{"input": "5", "expected_output": "25"}, {"input": "-3", "expected_output": "9"}],
    },
    {
        "title": "Absolute Value",
        "slug": "absolute-value",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given an integer N, find its absolute value (positive value).\n\nExample:\nInput: -10\nOutput: 10",
        "starter_code": {"python": "n = int(input())\nprint(abs(n))"},
        "testcases": [{"input": "-10", "expected_output": "10"}, {"input": "5", "expected_output": "5"}],
    },
    {
        "title": "Is Vowel Or Consonant",
        "slug": "is-vowel-or-consonant",
        "difficulty": "Easy",
        "tags": ["String", "Basic"],
        "description": "Given a single alphabet letter, print 'Vowel' if it is a/e/i/o/u (case-insensitive) else 'Consonant'.\n\nExample:\nInput: a\nOutput: Vowel",
        "starter_code": {"python": "char = input().strip().lower()\nprint('Vowel' if char in 'aeiou' else 'Consonant')"},
        "testcases": [{"input": "a", "expected_output": "Vowel"}, {"input": "z", "expected_output": "Consonant"}],
    },
    {
        "title": "Count Odd Numbers",
        "slug": "count-odd-numbers",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given a positive limit N, count how many odd numbers exist between 1 and N inclusive.\n\nExample:\nInput: 5\nOutput: 3",
        "starter_code": {"python": "n = int(input())\nprint((n + 1) // 2)"},
        "testcases": [{"input": "5", "expected_output": "3"}, {"input": "10", "expected_output": "5"}],
    },
    {
        "title": "Multiplication Table",
        "slug": "multiplication-table",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Print the first 5 multiples of N, separated by spaces.\n\nExample:\nInput: 3\nOutput: 3 6 9 12 15",
        "starter_code": {"python": "n = int(input())\nprint(*(n*i for i in range(1, 6)))"},
        "testcases": [{"input": "3", "expected_output": "3 6 9 12 15"}, {"input": "5", "expected_output": "5 10 15 20 25"}],
    },
    {
        "title": "Positive Negative Or Zero",
        "slug": "positive-negative-or-zero",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given a number N, print 'Positive', 'Negative', or 'Zero'.\n\nExample:\nInput: -5\nOutput: Negative",
        "starter_code": {"python": "n = int(input())\nif n > 0: print('Positive')\nelif n < 0: print('Negative')\nelse: print('Zero')"},
        "testcases": [{"input": "-5", "expected_output": "Negative"}, {"input": "0", "expected_output": "Zero"}],
    },
    {
        "title": "Simple Interest",
        "slug": "simple-interest",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Calculate simple interest. Input contains principal, rate, time (P R T) space-separated. SI = (P*R*T)/100.\n\nExample:\nInput: 1000 5 2\nOutput: 100.0",
        "starter_code": {"python": "p, r, t = map(float, input().split())\nprint((p*r*t)/100)"},
        "testcases": [{"input": "1000 5 2", "expected_output": "100.0"}, {"input": "5000 3.5 4", "expected_output": "700.0"}],
    },
    {
        "title": "Area of Circle",
        "slug": "area-of-circle",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Calculate area of circle given radius R. Use pi = 3.14.\n\nExample:\nInput: 5\nOutput: 78.5",
        "starter_code": {"python": "r = float(input())\nprint(3.14 * r * r)"},
        "testcases": [{"input": "5", "expected_output": "78.5"}, {"input": "10", "expected_output": "314.0"}],
    },
    {
        "title": "ASCII Value finder",
        "slug": "ascii-value-finder",
        "difficulty": "Easy",
        "tags": ["String", "Basic"],
        "description": "Given a single character, return its ASCII integer value.\n\nExample:\nInput: A\nOutput: 65",
        "starter_code": {"python": "print(ord(input().strip()))"},
        "testcases": [{"input": "A", "expected_output": "65"}, {"input": "a", "expected_output": "97"}],
    },
    {
        "title": "Kilometer To Mile",
        "slug": "kilometer-to-mile",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Convert distance in kilometers to miles (1 km = 0.621371 miles).\n\nExample:\nInput: 10\nOutput: 6.21371",
        "starter_code": {"python": "km = float(input())\nprint(km * 0.621371)"},
        "testcases": [{"input": "10", "expected_output": "6.21371"}, {"input": "1", "expected_output": "0.621371"}],
    },
    {
        "title": "Power Calculation",
        "slug": "power-calculation",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given base and exponent (A B) space-separated, print A raised to the power of B (A^B).\n\nExample:\nInput: 2 3\nOutput: 8",
        "starter_code": {"python": "a, b = map(int, input().split())\nprint(a**b)"},
        "testcases": [{"input": "2 3", "expected_output": "8"}, {"input": "5 4", "expected_output": "625"}],
    },
    {
        "title": "Print Alphabet",
        "slug": "print-alphabet",
        "difficulty": "Easy",
        "tags": ["String", "Basic"],
        "description": "Print letters from A to Z separated by spaces.\n\nOutput:\nA B C D ... Z",
        "starter_code": {"python": "print(*(chr(i) for i in range(65, 91)))"},
        "testcases": [{"input": "", "expected_output": "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z"}],
    },
    {
        "title": "Last Digit of Number",
        "slug": "last-digit-of-number",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given an integer N, print its last digit.\n\nExample:\nInput: 1254\nOutput: 4",
        "starter_code": {"python": "print(input().strip()[-1])"},
        "testcases": [{"input": "1254", "expected_output": "4"}, {"input": "9", "expected_output": "9"}],
    },
    {
        "title": "Factor Checker",
        "slug": "factor-checker",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Checking if A is a factor of B. Input is space-separated integers A and B.\n\nExample:\nInput: 3 12\nOutput: Yes",
        "starter_code": {"python": "a, b = map(int, input().split())\nprint('Yes' if b % a == 0 else 'No')"},
        "testcases": [{"input": "3 12", "expected_output": "Yes"}, {"input": "5 12", "expected_output": "No"}],
    },
    {
        "title": "Multiply Two Numbers",
        "slug": "multiply-two-numbers",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given two space-separated integers A and B, print their product.\n\nExample:\nInput: 5 6\nOutput: 30",
        "starter_code": {"python": "a, b = map(int, input().split())\nprint(a*b)"},
        "testcases": [{"input": "5 6", "expected_output": "30"}, {"input": "10 5", "expected_output": "50"}],
    },
    {
        "title": "Average of Three",
        "slug": "average-of-three",
        "difficulty": "Easy",
        "tags": ["Math", "Basic"],
        "description": "Given three space-separated integers A, B and C, print their average value.\n\nExample:\nInput: 10 20 30\nOutput: 20.0",
        "starter_code": {"python": "a, b, c = map(int, input().split())\nprint((a+b+c)/3)"},
        "testcases": [{"input": "10 20 30", "expected_output": "20.0"}, {"input": "5 5 5", "expected_output": "5.0"}],
    },
    {
        "title": "Swap Two Numbers",
        "slug": "swap-two-numbers",
        "difficulty": "Easy",
        "tags": ["Basic"],
        "description": "Given two space-separated values A and B, print them swapped (B A).\n\nExample:\nInput: hello world\nOutput: world hello",
        "starter_code": {"python": "a, b = input().split()\nprint(b, a)"},
        "testcases": [{"input": "hello world", "expected_output": "world hello"}, {"input": "10 20", "expected_output": "20 10"}],
    },
]

def dict_to_firestore_val(val):
    if isinstance(val, dict):
        return {"mapValue": {"fields": {k: dict_to_firestore_val(v) for k, v in val.items()}}}
    elif isinstance(val, list):
        return {"arrayValue": {"values": [dict_to_firestore_val(v) for v in val]}}
    elif isinstance(val, bool):
        return {"booleanValue": val}
    elif isinstance(val, (int, float)):
        return {"doubleValue" if isinstance(val, float) else "integerValue": str(val) if isinstance(val, int) else val}
    else:
        return {"stringValue": str(val)}

def main():
    print("Uploading 20 simple basic questions to Firestore using public REST API...")
    for i, p in enumerate(PROBLEMS):
        doc_id = uuid.uuid4().hex
        p["id"] = doc_id
        
        doc_data = {
            "fields": {k: dict_to_firestore_val(v) for k, v in p.items()}
        }
        
        url = f"{FIRESTORE_URL}/{doc_id}"
        req = urllib.request.Request(
            url,
            data=json.dumps(doc_data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PATCH"
        )
        
        try:
            with urllib.request.urlopen(req) as res:
                res.read()
            print(f"[{i+1}/{len(PROBLEMS)}] Added: {p['title']}")
        except Exception as e:
            print(f"[{i+1}/{len(PROBLEMS)}] Failed: {p['title']} - Error: {e}")

    print("\n✅ Done seeding 20 simple basic problems!")

if __name__ == "__main__":
    main()
