package com.fullstory.reactnative;

import android.view.View;

import com.facebook.react.bridge.ReadableMap;
import com.fullstory.FS;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.WeakHashMap;

public class FullStoryNativeProps {
    // Keeps a list of the attributes set on a given View, so we can clear out the attributes
    // any time set_fsAttribute is called.
    private static final WeakHashMap<View, List<String>> ATTR_LIST = new WeakHashMap<>();

    private FullStoryNativeProps() {
        // prevent instantiation
    }

    @NativeProp(name = "fsAttribute")
    public static void set_fsAttribute(View view, ReadableMap fsAttributes) {
        // Always clear out the existing attributes first.
        // Note that, since the dataComponent, dataElement, and dataSourceFile values are stores as
        // attributes, we can't just clear out all existing attributes. Instead, we must keep track
        // of all of the attributes that were set and remove them individually.
        List<String> existingAttributes = ATTR_LIST.remove(view);
        if (existingAttributes != null) {
            for (String attr : existingAttributes) {
                FS.removeAttribute(view, attr);
            }
        }
        if (fsAttributes == null) {
            return;
        }

        List<String> newAttributes = new ArrayList<>();
        Iterator<Map.Entry<String, Object>> it = fsAttributes.getEntryIterator();
        while (it.hasNext()) {
            Map.Entry<String, Object> entry = it.next();

            Object obj = entry.getValue();

            String value;
            if (obj == null || obj instanceof String) {
                value = (String) obj;
            } else {
                value = obj.toString();
            }

            String key = entry.getKey();
            newAttributes.add(key);
            FS.setAttribute(view, key, value);
        }

        // Store the new list of attributes.
        ATTR_LIST.put(view, newAttributes);
    }

    @NativeProp(name = "fsClass")
    public static void set_fsClass(View view, String fsClass) {
        // always clear out the existing classes first
        FS.removeAllClasses(view);

        if (fsClass == null) {
            // nothing to do
            return;
        }

        String[] splits = fsClass.split(",");
        int length = splits.length;
        if (length == 0) {
            // nothing to do
            return;
        }

        if (length == 1) {
            FS.addClass(view, splits[0]);
        } else {
            FS.addClasses(view, Arrays.asList(splits));
        }
    }

    @NativeProp(name = "fsTagName")
    public static void set_fsTagName(View view, String fsTagName) {
        FS.setTagName(view, fsTagName);
    }

    @NativeProp(name = "dataComponent")
    public static void set_dataComponent(View view, String value) {
        setElementIdentity(view, "data-component", value);
    }

    @NativeProp(name = "dataElement")
    public static void set_dataElement(View view, String value) {
        setElementIdentity(view, "data-element", value);
    }

    @NativeProp(name = "dataSourceFile")
    public static void set_dataSourceFile(View view, String value) {
        setElementIdentity(view, "data-source-file", value);
    }

    public static void setProperty(View view, String propName, Object value) {
        switch (propName) {
            case "fsAttribute":
                if (value == null || value instanceof ReadableMap) {
                    set_fsAttribute(view, (ReadableMap) value);
                }
                break;
            case "fsClass":
                if (value == null || value instanceof String) {
                    set_fsClass(view, (String) value);
                }
                break;
            case "fsTagName":
                if (value == null || value instanceof String) {
                    set_fsTagName(view, (String) value);
                }
                break;
            case "dataComponent":
                if (value == null || value instanceof String) {
                    set_dataComponent(view, (String) value);
                }
                break;
            case "dataElement":
                if (value == null || value instanceof String) {
                    set_dataElement(view, (String) value);
                }
                break;
            case "dataSourceFile":
                if (value == null || value instanceof String) {
                    set_dataSourceFile(view, (String) value);
                }
                break;
        }
    }

    private static void setElementIdentity(View view, String key, String value) {
        if (value == null) {
            FS.removeAttribute(view, key);
            return;
        }

        FS.setAttribute(view, key, value);
    }
}
