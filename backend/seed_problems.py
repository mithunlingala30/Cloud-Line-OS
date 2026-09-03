"""
Run: python seed_problems.py
Seeds 50 problems into Firestore using the public REST API.
No serviceAccountKey.json is required!
"""
import json
import urllib.request
import uuid

PROJECT_ID = "leetcod-cec3f"
FIRESTORE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/problems"

PROBLEMS = [
    {
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "Easy",
        "tags": ["Array", "Hash Table"],
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
        "starter_code": {"python": "def twoSum(nums, target):\n    pass", "javascript": "function twoSum(nums, target) {\n\n}"},
        "testcases": [{"input": "2 7 11 15\n9", "expected_output": "0 1"}, {"input": "3 2 4\n6", "expected_output": "1 2"}],
    },
    {
        "title": "Reverse String",
        "slug": "reverse-string",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Write a function that reverses a string.\n\nExample:\nInput: hello\nOutput: olleh",
        "starter_code": {"python": "s = input()\nprint(s[::-1])"},
        "testcases": [{"input": "hello", "expected_output": "olleh"}, {"input": "world", "expected_output": "dlrow"}],
    },
    {
        "title": "Palindrome Check",
        "slug": "palindrome-check",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Given a string, check if it is a palindrome.\n\nExample:\nInput: racecar\nOutput: True",
        "starter_code": {"python": "s = input()\nprint(s == s[::-1])"},
        "testcases": [{"input": "racecar", "expected_output": "True"}, {"input": "hello", "expected_output": "False"}],
    },
    {
        "title": "FizzBuzz",
        "slug": "fizzbuzz",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Print numbers from 1 to N. For multiples of 3 print Fizz, for 5 print Buzz, for both print FizzBuzz.\n\nExample:\nInput: 15\nOutput: 1 2 Fizz 4 Buzz ...",
        "starter_code": {"python": "n = int(input())\nfor i in range(1, n+1):\n    if i%15==0: print('FizzBuzz')\n    elif i%3==0: print('Fizz')\n    elif i%5==0: print('Buzz')\n    else: print(i)"},
        "testcases": [{"input": "5", "expected_output": "1\n2\nFizz\n4\nBuzz"}, {"input": "3", "expected_output": "1\n2\nFizz"}],
    },
    {
        "title": "Factorial",
        "slug": "factorial",
        "difficulty": "Easy",
        "tags": ["Math", "Recursion"],
        "description": "Given a number N, return its factorial.\n\nExample:\nInput: 5\nOutput: 120",
        "starter_code": {"python": "n = int(input())\nimport math\nprint(math.factorial(n))"},
        "testcases": [{"input": "5", "expected_output": "120"}, {"input": "0", "expected_output": "1"}],
    },
    {
        "title": "Fibonacci Number",
        "slug": "fibonacci-number",
        "difficulty": "Easy",
        "tags": ["Math", "Dynamic Programming"],
        "description": "Given N, return the Nth Fibonacci number (0-indexed).\n\nExample:\nInput: 6\nOutput: 8",
        "starter_code": {"python": "n = int(input())\na, b = 0, 1\nfor _ in range(n): a, b = b, a+b\nprint(a)"},
        "testcases": [{"input": "6", "expected_output": "8"}, {"input": "0", "expected_output": "0"}],
    },
    {
        "title": "Count Vowels",
        "slug": "count-vowels",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Count the number of vowels in a given string.\n\nExample:\nInput: hello\nOutput: 2",
        "starter_code": {"python": "s = input()\nprint(sum(c in 'aeiouAEIOU' for c in s))"},
        "testcases": [{"input": "hello", "expected_output": "2"}, {"input": "programming", "expected_output": "3"}],
    },
    {
        "title": "Sum of Array",
        "slug": "sum-of-array",
        "difficulty": "Easy",
        "tags": ["Array"],
        "description": "Given N numbers, print their sum.\n\nExample:\nInput: 1 2 3 4 5\nOutput: 15",
        "starter_code": {"python": "print(sum(map(int, input().split())))"},
        "testcases": [{"input": "1 2 3 4 5", "expected_output": "15"}, {"input": "10 20 30", "expected_output": "60"}],
    },
    {
        "title": "Max in Array",
        "slug": "max-in-array",
        "difficulty": "Easy",
        "tags": ["Array"],
        "description": "Find the maximum element in an array.\n\nExample:\nInput: 3 1 4 1 5 9\nOutput: 9",
        "starter_code": {"python": "print(max(map(int, input().split())))"},
        "testcases": [{"input": "3 1 4 1 5 9", "expected_output": "9"}, {"input": "-1 -5 -2", "expected_output": "-1"}],
    },
    {
        "title": "Min in Array",
        "slug": "min-in-array",
        "difficulty": "Easy",
        "tags": ["Array"],
        "description": "Find the minimum element in an array.\n\nExample:\nInput: 3 1 4 1 5\nOutput: 1",
        "starter_code": {"python": "print(min(map(int, input().split())))"},
        "testcases": [{"input": "3 1 4 1 5", "expected_output": "1"}, {"input": "10 20 5", "expected_output": "5"}],
    },
    {
        "title": "Prime Check",
        "slug": "prime-check",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Check if a given number is prime.\n\nExample:\nInput: 7\nOutput: True",
        "starter_code": {"python": "n=int(input())\nprint(n>1 and all(n%i for i in range(2,int(n**0.5)+1)))"},
        "testcases": [{"input": "7", "expected_output": "True"}, {"input": "4", "expected_output": "False"}],
    },
    {
        "title": "GCD of Two Numbers",
        "slug": "gcd-two-numbers",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Find the GCD of two numbers.\n\nExample:\nInput: 12 8\nOutput: 4",
        "starter_code": {"python": "import math\na,b=map(int,input().split())\nprint(math.gcd(a,b))"},
        "testcases": [{"input": "12 8", "expected_output": "4"}, {"input": "100 75", "expected_output": "25"}],
    },
    {
        "title": "LCM of Two Numbers",
        "slug": "lcm-two-numbers",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Find the LCM of two numbers.\n\nExample:\nInput: 4 6\nOutput: 12",
        "starter_code": {"python": "import math\na,b=map(int,input().split())\nprint(a*b//math.gcd(a,b))"},
        "testcases": [{"input": "4 6", "expected_output": "12"}, {"input": "3 5", "expected_output": "15"}],
    },
    {
        "title": "Power of Two",
        "slug": "power-of-two",
        "difficulty": "Easy",
        "tags": ["Math", "Bit Manipulation"],
        "description": "Given an integer N, return True if it is a power of 2.\n\nExample:\nInput: 16\nOutput: True",
        "starter_code": {"python": "n=int(input())\nprint(n>0 and (n&(n-1))==0)"},
        "testcases": [{"input": "16", "expected_output": "True"}, {"input": "18", "expected_output": "False"}],
    },
    {
        "title": "Reverse Integer",
        "slug": "reverse-integer",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Reverse the digits of an integer.\n\nExample:\nInput: 123\nOutput: 321",
        "starter_code": {"python": "n=input().strip()\nprint(int(n[::-1]) if n[0]!='-' else -int(n[1:][::-1]))"},
        "testcases": [{"input": "123", "expected_output": "321"}, {"input": "-456", "expected_output": "-654"}],
    },
    {
        "title": "Sum of Digits",
        "slug": "sum-of-digits",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Find the sum of digits of a number.\n\nExample:\nInput: 123\nOutput: 6",
        "starter_code": {"python": "print(sum(int(c) for c in input() if c.isdigit()))"},
        "testcases": [{"input": "123", "expected_output": "6"}, {"input": "9999", "expected_output": "36"}],
    },
    {
        "title": "Armstrong Number",
        "slug": "armstrong-number",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Check if a number is an Armstrong number (sum of cubes of digits equals the number).\n\nExample:\nInput: 153\nOutput: True",
        "starter_code": {"python": "n=input()\nprint(sum(int(d)**len(n) for d in n)==int(n))"},
        "testcases": [{"input": "153", "expected_output": "True"}, {"input": "100", "expected_output": "False"}],
    },
    {
        "title": "Sort Array",
        "slug": "sort-array",
        "difficulty": "Easy",
        "tags": ["Array", "Sorting"],
        "description": "Sort an array of integers in ascending order.\n\nExample:\nInput: 5 3 1 4 2\nOutput: 1 2 3 4 5",
        "starter_code": {"python": "print(*sorted(map(int,input().split())))"},
        "testcases": [{"input": "5 3 1 4 2", "expected_output": "1 2 3 4 5"}, {"input": "9 -1 0 5", "expected_output": "-1 0 5 9"}],
    },
    {
        "title": "Remove Duplicates",
        "slug": "remove-duplicates",
        "difficulty": "Easy",
        "tags": ["Array", "Hash Table"],
        "description": "Remove duplicates from a sorted array and print unique elements.\n\nExample:\nInput: 1 1 2 3 3\nOutput: 1 2 3",
        "starter_code": {"python": "print(*dict.fromkeys(map(int,input().split())))"},
        "testcases": [{"input": "1 1 2 3 3", "expected_output": "1 2 3"}, {"input": "5 5 5", "expected_output": "5"}],
    },
    {
        "title": "Word Count",
        "slug": "word-count",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Count the number of words in a sentence.\n\nExample:\nInput: hello world\nOutput: 2",
        "starter_code": {"python": "print(len(input().split()))"},
        "testcases": [{"input": "hello world", "expected_output": "2"}, {"input": "one two three four", "expected_output": "4"}],
    },
    {
        "title": "Second Largest",
        "slug": "second-largest",
        "difficulty": "Easy",
        "tags": ["Array"],
        "description": "Find the second largest element in an array.\n\nExample:\nInput: 10 20 5 30\nOutput: 20",
        "starter_code": {"python": "a=sorted(set(map(int,input().split())),reverse=True)\nprint(a[1])"},
        "testcases": [{"input": "10 20 5 30", "expected_output": "20"}, {"input": "1 2", "expected_output": "1"}],
    },
    {
        "title": "Binary Search",
        "slug": "binary-search",
        "difficulty": "Easy",
        "tags": ["Array", "Binary Search"],
        "description": "Given a sorted array and a target, return the index of target or -1.\n\nInput format: first line is space-separated sorted array, second line is target.\n\nExample:\nInput: 1 3 5 7 9\n5\nOutput: 2",
        "starter_code": {"python": "a=list(map(int,input().split()))\nt=int(input())\nprint(a.index(t) if t in a else -1)"},
        "testcases": [{"input": "1 3 5 7 9\n5", "expected_output": "2"}, {"input": "2 4 6\n5", "expected_output": "-1"}],
    },
    {
        "title": "Linear Search",
        "slug": "linear-search",
        "difficulty": "Easy",
        "tags": ["Array"],
        "description": "Given an array and a target, return its index or -1.\n\nExample:\nInput: 4 2 7 1\n7\nOutput: 2",
        "starter_code": {"python": "a=list(map(int,input().split()))\nt=int(input())\nprint(a.index(t) if t in a else -1)"},
        "testcases": [{"input": "4 2 7 1\n7", "expected_output": "2"}, {"input": "1 2 3\n9", "expected_output": "-1"}],
    },
    {
        "title": "Anagram Check",
        "slug": "anagram-check",
        "difficulty": "Easy",
        "tags": ["String", "Hash Table"],
        "description": "Check if two strings are anagrams.\n\nExample:\nInput: listen\nsilent\nOutput: True",
        "starter_code": {"python": "a,b=input(),input()\nprint(sorted(a)==sorted(b))"},
        "testcases": [{"input": "listen\nsilent", "expected_output": "True"}, {"input": "hello\nworld", "expected_output": "False"}],
    },
    {
        "title": "Count Occurrences",
        "slug": "count-occurrences",
        "difficulty": "Easy",
        "tags": ["Array", "Hash Table"],
        "description": "Count how many times a number appears in an array.\n\nInput: array on line 1, target on line 2.\n\nExample:\nInput: 1 2 2 3 2\n2\nOutput: 3",
        "starter_code": {"python": "a=list(map(int,input().split()))\nt=int(input())\nprint(a.count(t))"},
        "testcases": [{"input": "1 2 2 3 2\n2", "expected_output": "3"}, {"input": "5 5 5 5\n5", "expected_output": "4"}],
    },
    {
        "title": "Bubble Sort",
        "slug": "bubble-sort",
        "difficulty": "Medium",
        "tags": ["Array", "Sorting"],
        "description": "Implement bubble sort and print the sorted array.\n\nExample:\nInput: 64 34 25 12 22\nOutput: 12 22 25 34 64",
        "starter_code": {"python": "a=list(map(int,input().split()))\nn=len(a)\nfor i in range(n):\n    for j in range(n-i-1):\n        if a[j]>a[j+1]: a[j],a[j+1]=a[j+1],a[j]\nprint(*a)"},
        "testcases": [{"input": "64 34 25 12 22", "expected_output": "12 22 25 34 64"}, {"input": "5 1 4 2 8", "expected_output": "1 2 4 5 8"}],
    },
    {
        "title": "Valid Parentheses",
        "slug": "valid-parentheses",
        "difficulty": "Easy",
        "tags": ["Stack", "String"],
        "description": "Given a string of brackets, determine if it is valid.\n\nExample:\nInput: (())\nOutput: True",
        "starter_code": {"python": "s=input()\nstack=[]\nfor c in s:\n    if c in '([{': stack.append(c)\n    elif (not stack) or {')':'(',']':'[','}':'{'}[c]!=stack.pop(): print(False);exit()\nprint(not stack)"},
        "testcases": [{"input": "(())", "expected_output": "True"}, {"input": "([)]", "expected_output": "False"}],
    },
    {
        "title": "Next Greater Element",
        "slug": "next-greater-element",
        "difficulty": "Medium",
        "tags": ["Array", "Stack"],
        "description": "For each element in the array, find the next greater element. Output -1 if none.\n\nExample:\nInput: 4 5 2 10\nOutput: 5 10 10 -1",
        "starter_code": {"python": "a=list(map(int,input().split()))\nres=[-1]*len(a)\nstack=[]\nfor i,v in enumerate(a):\n    while stack and a[stack[-1]]<v:\n        res[stack.pop()]=v\n    stack.append(i)\nprint(*res)"},
        "testcases": [{"input": "4 5 2 10", "expected_output": "5 10 10 -1"}, {"input": "3 2 1", "expected_output": "-1 -1 -1"}],
    },
    {
        "title": "Majority Element",
        "slug": "majority-element",
        "difficulty": "Easy",
        "tags": ["Array", "Hash Table"],
        "description": "Find the element that appears more than n/2 times.\n\nExample:\nInput: 3 2 3\nOutput: 3",
        "starter_code": {"python": "a=list(map(int,input().split()))\nfrom collections import Counter\nprint(Counter(a).most_common(1)[0][0])"},
        "testcases": [{"input": "3 2 3", "expected_output": "3"}, {"input": "2 2 1 1 1 2 2", "expected_output": "2"}],
    },
    {
        "title": "Rotate Array",
        "slug": "rotate-array",
        "difficulty": "Medium",
        "tags": ["Array"],
        "description": "Rotate array to the right by k steps.\nLine 1: array, Line 2: k.\n\nExample:\nInput: 1 2 3 4 5\n2\nOutput: 4 5 1 2 3",
        "starter_code": {"python": "a=list(map(int,input().split()))\nk=int(input())\nk%=len(a)\nprint(*(a[-k:]+a[:-k]))"},
        "testcases": [{"input": "1 2 3 4 5\n2", "expected_output": "4 5 1 2 3"}, {"input": "1 2 3\n1", "expected_output": "3 1 2"}],
    },
    {
        "title": "Single Number",
        "slug": "single-number",
        "difficulty": "Easy",
        "tags": ["Array", "Bit Manipulation"],
        "description": "Every element appears twice except one. Find that one.\n\nExample:\nInput: 4 1 2 1 2\nOutput: 4",
        "starter_code": {"python": "from functools import reduce\nfrom operator import xor\nprint(reduce(xor,map(int,input().split())))"},
        "testcases": [{"input": "4 1 2 1 2", "expected_output": "4"}, {"input": "2 2 1", "expected_output": "1"}],
    },
    {
        "title": "Missing Number",
        "slug": "missing-number",
        "difficulty": "Easy",
        "tags": ["Array", "Math"],
        "description": "Array contains n distinct numbers from 0 to n. Find the missing one.\n\nExample:\nInput: 3 0 1\nOutput: 2",
        "starter_code": {"python": "a=list(map(int,input().split()))\nn=len(a)\nprint(n*(n+1)//2-sum(a))"},
        "testcases": [{"input": "3 0 1", "expected_output": "2"}, {"input": "0 1", "expected_output": "2"}],
    },
    {
        "title": "Merge Sorted Arrays",
        "slug": "merge-sorted-arrays",
        "difficulty": "Easy",
        "tags": ["Array", "Sorting"],
        "description": "Merge two sorted arrays into one sorted array.\nLine 1: first array, Line 2: second array.\n\nExample:\nInput: 1 3 5\n2 4 6\nOutput: 1 2 3 4 5 6",
        "starter_code": {"python": "a=list(map(int,input().split()))\nb=list(map(int,input().split()))\nprint(*sorted(a+b))"},
        "testcases": [{"input": "1 3 5\n2 4 6", "expected_output": "1 2 3 4 5 6"}, {"input": "1 2\n3 4", "expected_output": "1 2 3 4"}],
    },
    {
        "title": "Intersection of Arrays",
        "slug": "intersection-of-arrays",
        "difficulty": "Easy",
        "tags": ["Array", "Hash Table"],
        "description": "Find the intersection of two arrays (sorted output).\n\nExample:\nInput: 1 2 2 1\n2 2\nOutput: 2",
        "starter_code": {"python": "a=set(map(int,input().split()))\nb=set(map(int,input().split()))\nprint(*sorted(a&b))"},
        "testcases": [{"input": "1 2 2 1\n2 2", "expected_output": "2"}, {"input": "4 9 5\n9 4 9 8 4", "expected_output": "4 9"}],
    },
    {
        "title": "Union of Arrays",
        "slug": "union-of-arrays",
        "difficulty": "Easy",
        "tags": ["Array", "Hash Table"],
        "description": "Find the union of two arrays (unique elements, sorted).\n\nExample:\nInput: 1 2 3\n2 3 4\nOutput: 1 2 3 4",
        "starter_code": {"python": "a=set(map(int,input().split()))\nb=set(map(int,input().split()))\nprint(*sorted(a|b))"},
        "testcases": [{"input": "1 2 3\n2 3 4", "expected_output": "1 2 3 4"}, {"input": "5 5\n5 6", "expected_output": "5 6"}],
    },
    {
        "title": "Even or Odd",
        "slug": "even-or-odd",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Print Even or Odd for a given number.\n\nExample:\nInput: 4\nOutput: Even",
        "starter_code": {"python": "n=int(input())\nprint('Even' if n%2==0 else 'Odd')"},
        "testcases": [{"input": "4", "expected_output": "Even"}, {"input": "7", "expected_output": "Odd"}],
    },
    {
        "title": "Celsius to Fahrenheit",
        "slug": "celsius-to-fahrenheit",
        "difficulty": "Easy",
        "tags": ["Math"],
        "description": "Convert Celsius to Fahrenheit. Formula: F = C*9/5 + 32\n\nExample:\nInput: 100\nOutput: 212.0",
        "starter_code": {"python": "c=float(input())\nprint(c*9/5+32)"},
        "testcases": [{"input": "100", "expected_output": "212.0"}, {"input": "0", "expected_output": "32.0"}],
    },
    {
        "title": "String Length",
        "slug": "string-length",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Print the length of a string.\n\nExample:\nInput: hello\nOutput: 5",
        "starter_code": {"python": "print(len(input()))"},
        "testcases": [{"input": "hello", "expected_output": "5"}, {"input": "programming", "expected_output": "11"}],
    },
    {
        "title": "Uppercase String",
        "slug": "uppercase-string",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Convert a string to uppercase.\n\nExample:\nInput: hello\nOutput: HELLO",
        "starter_code": {"python": "print(input().upper())"},
        "testcases": [{"input": "hello", "expected_output": "HELLO"}, {"input": "world", "expected_output": "WORLD"}],
    },
    {
        "title": "Count Words Frequency",
        "slug": "count-words-frequency",
        "difficulty": "Medium",
        "tags": ["String", "Hash Table"],
        "description": "Count frequency of each word (sorted alphabetically).\n\nExample:\nInput: apple banana apple\nOutput: apple 2\nbanana 1",
        "starter_code": {"python": "from collections import Counter\nfor k,v in sorted(Counter(input().split()).items()):\n    print(k,v)"},
        "testcases": [{"input": "apple banana apple", "expected_output": "apple 2\nbanana 1"}, {"input": "a b a b c", "expected_output": "a 2\nb 2\nc 1"}],
    },
    {
        "title": "Matrix Transpose",
        "slug": "matrix-transpose",
        "difficulty": "Medium",
        "tags": ["Array", "Matrix"],
        "description": "Given a 2x2 matrix, print its transpose.\nInput: 2 rows of 2 numbers.\n\nExample:\nInput: 1 2\n3 4\nOutput: 1 3\n2 4",
        "starter_code": {"python": "a=[list(map(int,input().split())) for _ in range(2)]\nfor r in zip(*a): print(*r)"},
        "testcases": [{"input": "1 2\n3 4", "expected_output": "1 3\n2 4"}, {"input": "5 6\n7 8", "expected_output": "5 7\n6 8"}],
    },
    {
        "title": "Sum of Matrix",
        "slug": "sum-of-matrix",
        "difficulty": "Easy",
        "tags": ["Array", "Matrix"],
        "description": "Given a 2x2 matrix, print the sum of all elements.\n\nExample:\nInput: 1 2\n3 4\nOutput: 10",
        "starter_code": {"python": "total=0\nfor _ in range(2):\n    total+=sum(map(int,input().split()))\nprint(total)"},
        "testcases": [{"input": "1 2\n3 4", "expected_output": "10"}, {"input": "5 5\n5 5", "expected_output": "20"}],
    },
    {
        "title": "Perfect Number",
        "slug": "perfect-number",
        "difficulty": "Medium",
        "tags": ["Math"],
        "description": "A perfect number equals sum of its proper divisors. Check if N is perfect.\n\nExample:\nInput: 28\nOutput: True",
        "starter_code": {"python": "n=int(input())\nprint(n>1 and sum(i for i in range(1,n) if n%i==0)==n)"},
        "testcases": [{"input": "28", "expected_output": "True"}, {"input": "12", "expected_output": "False"}],
    },
    {
        "title": "Reverse Words",
        "slug": "reverse-words",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Reverse the words in a sentence.\n\nExample:\nInput: hello world\nOutput: world hello",
        "starter_code": {"python": "print(' '.join(input().split()[::-1]))"},
        "testcases": [{"input": "hello world", "expected_output": "world hello"}, {"input": "the sky is blue", "expected_output": "blue is sky the"}],
    },
    {
        "title": "Longest Word",
        "slug": "longest-word",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Find the longest word in a sentence.\n\nExample:\nInput: I love programming\nOutput: programming",
        "starter_code": {"python": "print(max(input().split(), key=len))"},
        "testcases": [{"input": "I love programming", "expected_output": "programming"}, {"input": "cat elephant dog", "expected_output": "elephant"}],
    },
    {
        "title": "Count Digits",
        "slug": "count-digits",
        "difficulty": "Easy",
        "tags": ["Math", "String"],
        "description": "Count the number of digits in a number.\n\nExample:\nInput: 12345\nOutput: 5",
        "starter_code": {"python": "print(len(input().strip()))"},
        "testcases": [{"input": "12345", "expected_output": "5"}, {"input": "1000000", "expected_output": "7"}],
    },
    {
        "title": "Subarray Sum",
        "slug": "subarray-sum",
        "difficulty": "Medium",
        "tags": ["Array", "Hash Table"],
        "description": "Count subarrays that sum to K.\nLine 1: array, Line 2: K.\n\nExample:\nInput: 1 1 1\n2\nOutput: 2",
        "starter_code": {"python": "from collections import defaultdict\na=list(map(int,input().split()))\nk=int(input())\ncount=prefix=0\nd=defaultdict(int)\nd[0]=1\nfor x in a:\n    prefix+=x\n    count+=d[prefix-k]\n    d[prefix]+=1\nprint(count)"},
        "testcases": [{"input": "1 1 1\n2", "expected_output": "2"}, {"input": "1 2 3\n3", "expected_output": "2"}],
    },
    {
        "title": "Climbing Stairs",
        "slug": "climbing-stairs",
        "difficulty": "Easy",
        "tags": ["Dynamic Programming"],
        "description": "You can climb 1 or 2 steps. How many ways to reach step N?\n\nExample:\nInput: 3\nOutput: 3",
        "starter_code": {"python": "n=int(input())\na,b=1,1\nfor _ in range(n-1): a,b=b,a+b\nprint(b)"},
        "testcases": [{"input": "3", "expected_output": "3"}, {"input": "4", "expected_output": "5"}],
    },
    {
        "title": "Coin Change",
        "slug": "coin-change",
        "difficulty": "Medium",
        "tags": ["Dynamic Programming"],
        "description": "Given coins and amount, find minimum coins needed. Return -1 if not possible.\nLine 1: coins, Line 2: amount.\n\nExample:\nInput: 1 5 6 9\n11\nOutput: 2",
        "starter_code": {"python": "coins=list(map(int,input().split()))\namt=int(input())\ndp=[float('inf')]*(amt+1)\ndp[0]=0\nfor i in range(1,amt+1):\n    for c in coins:\n        if c<=i: dp[i]=min(dp[i],dp[i-c]+1)\nprint(dp[amt] if dp[amt]!=float('inf') else -1)"},
        "testcases": [{"input": "1 5 6 9\n11", "expected_output": "2"}, {"input": "2\n3", "expected_output": "-1"}],
    },
    {
        "title": "Longest Common Prefix",
        "slug": "longest-common-prefix",
        "difficulty": "Easy",
        "tags": ["String"],
        "description": "Find the longest common prefix among all words.\n\nExample:\nInput: flower flow flight\nOutput: fl",
        "starter_code": {"python": "words=input().split()\nprefix=words[0]\nfor w in words[1:]:\n    while not w.startswith(prefix): prefix=prefix[:-1]\nprint(prefix)"},
        "testcases": [{"input": "flower flow flight", "expected_output": "fl"}, {"input": "dog racecar car", "expected_output": ""}],
    },
    {
        "title": "Number of Islands",
        "slug": "number-of-islands",
        "difficulty": "Medium",
        "tags": ["Array", "Graph", "BFS"],
        "description": "Count number of islands in a 2D grid (1=land, 0=water).\nInput: N lines each with space-separated 0/1.\n\nExample:\nInput: 1 1 0\n0 1 0\n0 0 1\nOutput: 2",
        "starter_code": {"python": "import sys\nfrom collections import deque\nlines=[]\nfor line in sys.stdin: lines.append(line.split())\ngrid=[[int(c) for c in r] for r in lines]\nrows,cols=len(grid),len(grid[0]);count=0\nfor r in range(rows):\n    for c in range(cols):\n        if grid[r][c]==1:\n            count+=1;q=deque([(r,c)]);grid[r][c]=0\n            while q:\n                x,y=q.popleft()\n                for dx,dy in[(-1,0),(1,0),(0,-1),(0,1)]:\n                    nx,ny=x+dx,y+dy\n                    if 0<=nx<rows and 0<=ny<cols and grid[nx][ny]==1:\n                        grid[nx][ny]=0;q.append((nx,ny))\nprint(count)"},
        "testcases": [{"input": "1 1 0\n0 1 0\n0 0 1", "expected_output": "2"}, {"input": "1 0\n0 1", "expected_output": "2"}],
    },
    {
        "title": "Maximum Subarray (Kadane's)",
        "slug": "maximum-subarray",
        "difficulty": "Medium",
        "tags": ["Array", "Dynamic Programming"],
        "description": "Find the contiguous subarray with the largest sum.\n\nExample:\nInput: -2 1 -3 4 -1 2 1 -5 4\nOutput: 6",
        "starter_code": {"python": "a=list(map(int,input().split()))\ncur=best=a[0]\nfor x in a[1:]:\n    cur=max(x,cur+x)\n    best=max(best,cur)\nprint(best)"},
        "testcases": [{"input": "-2 1 -3 4 -1 2 1 -5 4", "expected_output": "6"}, {"input": "1 2 3 4", "expected_output": "10"}],
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
    print("Uploading 50 questions to Firestore using public REST API...")
    for i, p in enumerate(PROBLEMS):
        doc_id = uuid.uuid4().hex
        p["id"] = doc_id
        
        # Format the document for Firestore REST API
        doc_data = {
            "fields": {k: dict_to_firestore_val(v) for k, v in p.items()}
        }
        
        url = f"{FIRESTORE_URL}/{doc_id}"
        req = urllib.request.Request(
            url,
            data=json.dumps(doc_data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PATCH" # PATCH will create or overwrite this document ID
        )
        
        try:
            with urllib.request.urlopen(req) as res:
                res.read()
            print(f"[{i+1}/{len(PROBLEMS)}] Added: {p['title']}")
        except Exception as e:
            print(f"[{i+1}/{len(PROBLEMS)}] Failed: {p['title']} - Error: {e}")

    print("\n✅ Done seeding 50 problems!")

if __name__ == "__main__":
    main()
