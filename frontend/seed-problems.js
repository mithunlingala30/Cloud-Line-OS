import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQd26G-KFe4fto0akSBD18MdKTaSGwfP8",
  authDomain: "leetcod-cec3f.firebaseapp.com",
  projectId: "leetcod-cec3f",
  storageBucket: "leetcod-cec3f.firebasestorage.app",
  messagingSenderId: "950711951342",
  appId: "1:950711951342:web:cc2e53c9f84f578165f8ff",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const problems = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nInput: First line is n (array size), second line has n space-separated integers, third line is the target.\nOutput: Two space-separated indices (0-indexed).",
    tags: ["array", "hash-map"],
    starter_code: {
      python: "n = int(input())\nnums = list(map(int, input().split()))\ntarget = int(input())\n# Write your solution below\n",
      cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    int target; cin >> target;\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\nint main() {\n    int n; scanf("%d", &n);\n    int nums[n];\n    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);\n    int target; scanf("%d", &target);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "4\n2 7 11 15\n9", expected_output: "0 1" },
      { input: "3\n3 2 4\n6", expected_output: "1 2" },
      { input: "2\n3 3\n6", expected_output: "0 1" },
    ],
  },
  {
    title: "Palindrome Check",
    slug: "palindrome-check",
    difficulty: "Easy",
    description: "Given a string s, determine if it is a palindrome (reads the same forwards and backwards). Ignore case.\n\nInput: A single string.\nOutput: 'true' or 'false'.",
    tags: ["string", "two-pointer"],
    starter_code: {
      python: "s = input().strip()\n# Write your solution below\n",
      cpp: '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s; getline(cin, s);\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\n#include <string.h>\nint main() {\n    char s[1001];\n    fgets(s, sizeof(s), stdin);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().trim();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "racecar", expected_output: "true" },
      { input: "hello", expected_output: "false" },
      { input: "Madam", expected_output: "true" },
    ],
  },
  {
    title: "Reverse Integer",
    slug: "reverse-integer",
    difficulty: "Medium",
    description: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], return 0.\n\nInput: A single integer x.\nOutput: The reversed integer or 0.",
    tags: ["math"],
    starter_code: {
      python: "x = int(input())\n# Write your solution below\n",
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    long long x; cin >> x;\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\nint main() {\n    long long x; scanf("%lld", &x);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long x = sc.nextLong();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "123", expected_output: "321" },
      { input: "-123", expected_output: "-321" },
      { input: "1534236469", expected_output: "0" },
    ],
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.\n\nInput: A single string.\nOutput: 'true' or 'false'.",
    tags: ["string", "stack"],
    starter_code: {
      python: "s = input().strip()\n# Write your solution below\n",
      cpp: '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\n#include <string.h>\nint main() {\n    char s[10001];\n    scanf("%s", s);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "()", expected_output: "true" },
      { input: "()[]{}", expected_output: "true" },
      { input: "(]", expected_output: "false" },
      { input: "([)]", expected_output: "false" },
    ],
  },
  {
    title: "FizzBuzz",
    slug: "fizzbuzz",
    difficulty: "Easy",
    description: "Given an integer n, for each number from 1 to n:\n- Print 'FizzBuzz' if divisible by both 3 and 5\n- Print 'Fizz' if divisible by 3\n- Print 'Buzz' if divisible by 5\n- Otherwise print the number\n\nInput: A single integer n.\nOutput: n lines of FizzBuzz output.",
    tags: ["math", "string"],
    starter_code: {
      python: "n = int(input())\n# Write your solution below\n",
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\nint main() {\n    int n; scanf("%d", &n);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "5", expected_output: "1\n2\nFizz\n4\nBuzz" },
      { input: "15", expected_output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
    ],
  },
  {
    title: "Fibonacci Number",
    slug: "fibonacci-number",
    difficulty: "Easy",
    description: "Given n, return the nth Fibonacci number. F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).\n\nInput: A single integer n.\nOutput: The nth Fibonacci number.",
    tags: ["math", "recursion", "dynamic-programming"],
    starter_code: {
      python: "n = int(input())\n# Write your solution below\n",
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\nint main() {\n    int n; scanf("%d", &n);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "0", expected_output: "0" },
      { input: "1", expected_output: "1" },
      { input: "10", expected_output: "55" },
    ],
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "Medium",
    description: "Given an integer array nums, find the subarray with the largest sum and return its sum (Kadane's algorithm).\n\nInput: First line is n (array size), second line has n space-separated integers.\nOutput: The maximum subarray sum.",
    tags: ["array", "dynamic-programming"],
    starter_code: {
      python: "n = int(input())\nnums = list(map(int, input().split()))\n# Write your solution below\n",
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\nint main() {\n    int n; scanf("%d", &n);\n    int nums[n];\n    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expected_output: "6" },
      { input: "1\n1", expected_output: "1" },
      { input: "5\n5 4 -1 7 8", expected_output: "23" },
    ],
  },
  {
    title: "Binary Search",
    slug: "binary-search",
    difficulty: "Easy",
    description: "Given a sorted array of integers and a target value, return the index of the target using binary search. If not found, return -1.\n\nInput: First line is n, second line has n sorted integers, third line is the target.\nOutput: Index of target or -1.",
    tags: ["array", "binary-search"],
    starter_code: {
      python: "n = int(input())\nnums = list(map(int, input().split()))\ntarget = int(input())\n# Write your solution below\n",
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    int target; cin >> target;\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\nint main() {\n    int n; scanf("%d", &n);\n    int nums[n];\n    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);\n    int target; scanf("%d", &target);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "6\n-1 0 3 5 9 12\n9", expected_output: "4" },
      { input: "6\n-1 0 3 5 9 12\n2", expected_output: "-1" },
    ],
  },
  {
    title: "Count Primes",
    slug: "count-primes",
    difficulty: "Medium",
    description: "Given an integer n, return the number of prime numbers that are strictly less than n (using Sieve of Eratosthenes).\n\nInput: A single integer n.\nOutput: Count of primes less than n.",
    tags: ["math", "sieve"],
    starter_code: {
      python: "n = int(input())\n# Write your solution below\n",
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\nint main() {\n    int n; scanf("%d", &n);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "10", expected_output: "4" },
      { input: "0", expected_output: "0" },
      { input: "1", expected_output: "0" },
    ],
  },
  {
    title: "Merge Sorted Arrays",
    slug: "merge-sorted-arrays",
    difficulty: "Easy",
    description: "Merge two sorted arrays into one sorted array and print the result.\n\nInput: First line is n, second line has n sorted integers, third line is m, fourth line has m sorted integers.\nOutput: Space-separated merged sorted array.",
    tags: ["array", "sorting", "two-pointer"],
    starter_code: {
      python: "n = int(input())\na = list(map(int, input().split()))\nm = int(input())\nb = list(map(int, input().split()))\n# Write your solution below\n",
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int m; cin >> m;\n    vector<int> b(m);\n    for (int i = 0; i < m; i++) cin >> b[i];\n    // Write your solution below\n    return 0;\n}\n',
      c: '#include <stdio.h>\nint main() {\n    int n; scanf("%d", &n);\n    int a[n];\n    for (int i = 0; i < n; i++) scanf("%d", &a[i]);\n    int m; scanf("%d", &m);\n    int b[m];\n    for (int i = 0; i < m; i++) scanf("%d", &b[i]);\n    // Write your solution below\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        int m = sc.nextInt();\n        int[] b = new int[m];\n        for (int i = 0; i < m; i++) b[i] = sc.nextInt();\n        // Write your solution below\n    }\n}\n',
    },
    testcases: [
      { input: "3\n1 3 5\n3\n2 4 6", expected_output: "1 2 3 4 5 6" },
      { input: "2\n1 2\n2\n3 4", expected_output: "1 2 3 4" },
    ],
  },
];

async function seed() {
  console.log("Clearing existing problems...");
  const snapshot = await getDocs(collection(db, "problems"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  console.log(`Deleted ${snapshot.size} existing problems.`);

  console.log("Seeding problems...");
  for (const problem of problems) {
    const docRef = await addDoc(collection(db, "problems"), problem);
    console.log(`Added: ${problem.title} (${docRef.id})`);
  }
  console.log(`\nDone! Seeded ${problems.length} problems.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
