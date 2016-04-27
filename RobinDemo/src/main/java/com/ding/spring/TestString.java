package com.ding.spring;

public class TestString {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
		//compare two string
		String str1 = "Hello World";
		String str2 = "hello world";
		String str3 = "Hello World";
		Object objStr = str1;
		
		System.out.println(str1.compareTo(str2));
		System.out.println(str1.compareToIgnoreCase(str2));
		System.out.println(str1.compareTo(objStr.toString()));
		System.out.println(str1==str2);
		System.out.println(str1==str3);
		System.out.println(str1==objStr.toString());
		System.out.println(str1.equals(str2));
		System.out.println(str1.equals(objStr));
	}

}
