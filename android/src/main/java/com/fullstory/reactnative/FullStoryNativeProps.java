package com.fullstory.reactnative;

import java.util.Arrays;
import java.util.Iterator;
import java.util.Map;

import android.view.View;

import com.facebook.react.bridge.ReadableMap;

import com.fullstory.FS;

public class FullStoryNativeProps {
    private FullStoryNativeProps() {
        // prevent instantiation
    }

    public static void set_fsAttribute(View view, ReadableMap fsAttributes) {
        // TODO: remove any attributes that were previously added

        if (fsAttributes == null) {
            return;
        }

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

            FS.setAttribute(view, entry.getKey(), value);
        }
    }

    public static void set_fsClass(View view, String fsClass) {
        // TODO: remove any classes that were previously added

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

    public static void set_fsTagName(View view, String fsTagName) {
        FS.setTagName(view, fsTagName);
    }

    public static void set_dataComponent(View view, String value) {
        setElementIdentity(view, "data-component", value);
    }

    public static void set_dataElement(View view, String value) {
        setElementIdentity(view, "data-element", value);
    }

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
