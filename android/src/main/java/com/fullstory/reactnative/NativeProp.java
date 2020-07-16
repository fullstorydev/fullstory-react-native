package com.fullstory.reactnative;

import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

@Retention(RUNTIME)
@Target(ElementType.METHOD)
public @interface NativeProp {
 /**
   * Name of the property exposed to JS
   */
  String name();
}
