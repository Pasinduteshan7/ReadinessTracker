package com.example.readinesstrackerbackend.util;

import java.util.*;

public class ProblemPoolData {
    
    public static List<Map<String, Object>> getEasyProblems() {
        List<Map<String, Object>> problems = new ArrayList<>();
        
        Map<String, Object> twoSum = new HashMap<>();
        twoSum.put("problem_code", "E001");
        twoSum.put("title", "Two Sum");
        twoSum.put("difficulty", "easy");
        twoSum.put("max_score", 60);
        twoSum.put("description", "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.");
        twoSum.put("example_input", "nums = [2,7,11,15], target = 9");
        twoSum.put("example_output", "[0,1]");
        twoSum.put("constraints", "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9");
        twoSum.put("expected_time_complexity", "O(n)");
        twoSum.put("expected_space_complexity", "O(n)");
        twoSum.put("topics", Arrays.asList("array", "hash_table"));
        problems.add(twoSum);
        
        Map<String, Object> validPalindrome = new HashMap<>();
        validPalindrome.put("problem_code", "E002");
        validPalindrome.put("title", "Valid Palindrome");
        validPalindrome.put("difficulty", "easy");
        validPalindrome.put("max_score", 60);
        validPalindrome.put("description", "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.");
        validPalindrome.put("example_input", "s = \"A man, a plan, a canal: Panama\"");
        validPalindrome.put("example_output", "true");
        validPalindrome.put("constraints", "1 <= s.length <= 2 * 10^5");
        validPalindrome.put("expected_time_complexity", "O(n)");
        validPalindrome.put("expected_space_complexity", "O(1)");
        validPalindrome.put("topics", Arrays.asList("string", "two_pointers"));
        problems.add(validPalindrome);
        
        Map<String, Object> reverseString = new HashMap<>();
        reverseString.put("problem_code", "E003");
        reverseString.put("title", "Reverse String");
        reverseString.put("difficulty", "easy");
        reverseString.put("max_score", 60);
        reverseString.put("description", "Write a function that reverses a string. The input string is given as an array of characters s.");
        reverseString.put("example_input", "s = ['h','e','l','l','o']");
        reverseString.put("example_output", "['o','l','l','e','h']");
        reverseString.put("constraints", "1 <= s.length <= 10^5");
        reverseString.put("expected_time_complexity", "O(n)");
        reverseString.put("expected_space_complexity", "O(1)");
        reverseString.put("topics", Arrays.asList("string", "two_pointers"));
        problems.add(reverseString);
        
        Map<String, Object> bestTime = new HashMap<>();
        bestTime.put("problem_code", "E004");
        bestTime.put("title", "Best Time to Buy and Sell Stock");
        bestTime.put("difficulty", "easy");
        bestTime.put("max_score", 60);
        bestTime.put("description", "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and a different day in the future to sell that stock.");
        bestTime.put("example_input", "prices = [7,1,5,3,6,4]");
        bestTime.put("example_output", "5");
        bestTime.put("constraints", "1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^4");
        bestTime.put("expected_time_complexity", "O(n)");
        bestTime.put("expected_space_complexity", "O(1)");
        bestTime.put("topics", Arrays.asList("array", "dynamic_programming"));
        problems.add(bestTime);
        
        Map<String, Object> containsDuplicate = new HashMap<>();
        containsDuplicate.put("problem_code", "E005");
        containsDuplicate.put("title", "Contains Duplicate");
        containsDuplicate.put("difficulty", "easy");
        containsDuplicate.put("max_score", 60);
        containsDuplicate.put("description", "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.");
        containsDuplicate.put("example_input", "nums = [1,2,3,1]");
        containsDuplicate.put("example_output", "true");
        containsDuplicate.put("constraints", "1 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9");
        containsDuplicate.put("expected_time_complexity", "O(n)");
        containsDuplicate.put("expected_space_complexity", "O(n)");
        containsDuplicate.put("topics", Arrays.asList("array", "hash_table"));
        problems.add(containsDuplicate);
        
        return problems;
    }
    
    public static List<Map<String, Object>> getMediumProblems() {
        List<Map<String, Object>> problems = new ArrayList<>();
        
        Map<String, Object> groupAnagrams = new HashMap<>();
        groupAnagrams.put("problem_code", "M001");
        groupAnagrams.put("title", "Group Anagrams");
        groupAnagrams.put("difficulty", "medium");
        groupAnagrams.put("max_score", 80);
        groupAnagrams.put("description", "Given an array of strings strs, group the anagrams together. You can return the answer in any order.");
        groupAnagrams.put("example_input", "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]");
        groupAnagrams.put("example_output", "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]");
        groupAnagrams.put("constraints", "1 <= strs.length <= 10^4, 0 <= strs[i].length <= 100");
        groupAnagrams.put("expected_time_complexity", "O(n * k log k)");
        groupAnagrams.put("expected_space_complexity", "O(n * k)");
        groupAnagrams.put("topics", Arrays.asList("string", "hash_table", "sorting"));
        problems.add(groupAnagrams);
        
        Map<String, Object> threeSum = new HashMap<>();
        threeSum.put("problem_code", "M002");
        threeSum.put("title", "3Sum");
        threeSum.put("difficulty", "medium");
        threeSum.put("max_score", 80);
        threeSum.put("description", "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.");
        threeSum.put("example_input", "nums = [-1,0,1,2,-1,-4]");
        threeSum.put("example_output", "[[-1,-1,2],[-1,0,1]]");
        threeSum.put("constraints", "3 <= nums.length <= 3000, -10^5 <= nums[i] <= 10^5");
        threeSum.put("expected_time_complexity", "O(n²)");
        threeSum.put("expected_space_complexity", "O(1)");
        threeSum.put("topics", Arrays.asList("array", "two_pointers", "sorting"));
        problems.add(threeSum);
        
        Map<String, Object> containerWater = new HashMap<>();
        containerWater.put("problem_code", "M003");
        containerWater.put("title", "Container With Most Water");
        containerWater.put("difficulty", "medium");
        containerWater.put("max_score", 80);
        containerWater.put("description", "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.");
        containerWater.put("example_input", "height = [1,8,6,2,5,4,8,3,7]");
        containerWater.put("example_output", "49");
        containerWater.put("constraints", "n == height.length, 2 <= n <= 10^5, 0 <= height[i] <= 10^4");
        containerWater.put("expected_time_complexity", "O(n)");
        containerWater.put("expected_space_complexity", "O(1)");
        containerWater.put("topics", Arrays.asList("array", "two_pointers", "greedy"));
        problems.add(containerWater);
        
        return problems;
    }
    
    public static List<Map<String, Object>> getHardProblems() {
        List<Map<String, Object>> problems = new ArrayList<>();
        
        Map<String, Object> trappingRain = new HashMap<>();
        trappingRain.put("problem_code", "H001");
        trappingRain.put("title", "Trapping Rain Water");
        trappingRain.put("difficulty", "hard");
        trappingRain.put("max_score", 100);
        trappingRain.put("description", "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.");
        trappingRain.put("example_input", "height = [0,1,0,2,1,0,1,3,2,1,2,1]");
        trappingRain.put("example_output", "6");
        trappingRain.put("constraints", "n == height.length, 1 <= n <= 2 * 10^4, 0 <= height[i] <= 10^5");
        trappingRain.put("expected_time_complexity", "O(n)");
        trappingRain.put("expected_space_complexity", "O(1)");
        trappingRain.put("topics", Arrays.asList("array", "two_pointers", "dynamic_programming", "stack"));
        problems.add(trappingRain);
        
        Map<String, Object> mergeKLists = new HashMap<>();
        mergeKLists.put("problem_code", "H002");
        mergeKLists.put("title", "Merge K Sorted Lists");
        mergeKLists.put("difficulty", "hard");
        mergeKLists.put("max_score", 100);
        mergeKLists.put("description", "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.");
        mergeKLists.put("example_input", "lists = [[1,4,5],[1,3,4],[2,6]]");
        mergeKLists.put("example_output", "[1,1,2,1,3,4,4,5,6]");
        mergeKLists.put("constraints", "k == lists.length, 0 <= k <= 10^4");
        mergeKLists.put("expected_time_complexity", "O(n log k)");
        mergeKLists.put("expected_space_complexity", "O(k)");
        mergeKLists.put("topics", Arrays.asList("linked_list", "heap", "divide_and_conquer"));
        problems.add(mergeKLists);
        
        return problems;
    }
}
