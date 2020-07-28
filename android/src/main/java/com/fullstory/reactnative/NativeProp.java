package com.fullstory.reactnative;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Retention(RUNTIME)
@Target(ElementType.METHOD)
public @interface NativeProp {
    /**
     * Name of the property exposed to JS
     */
    String name();
}
