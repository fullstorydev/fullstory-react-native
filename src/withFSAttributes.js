import hoist from "hoist-non-react-statics";
import React from "react";

// https://github.com/facebook/react-native/blob/ccefad049abc5aac4fac59e96c6ca2307efdb57f/Libraries/StyleSheet/flattenStyle.js
function flattenStyle(style) {
  if (style === null || typeof style !== "object") {
    return undefined;
  }

  if (!Array.isArray(style)) {
    return style;
  }

  const result = {};
  for (let i = 0, styleLength = style.length; i < styleLength; ++i) {
    const computedStyle = flattenStyle(style[i]);
    if (computedStyle) {
      for (const key in computedStyle) {
        result[key] = computedStyle[key];
      }
    }
  }
  return result;
}

// https://github.com/facebook/react-native/blob/43636267011a97490ed7495b08e500c5d0d54872/Libraries/StyleSheet/StyleSheet.js#L273
function compose(style1, style2) {
  if (style1 != null && style2 != null) {
    return [style1, style2];
  } else {
    return style1 != null ? style1 : style2;
  }
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

function merge(element, props) {
  const { style: sourceComponentStyle } = element.props;
  const { style: wrappedComponentStyle, ...rest } = props;

  const sourceComponentStyleFlattened = flattenStyle(sourceComponentStyle);
  const wrappedStyleFlattened = flattenStyle(wrappedComponentStyle);

  const style = compose(sourceComponentStyleFlattened, wrappedStyleFlattened);

  return React.cloneElement(element, {
    ...rest,
    style,
  });
}

// https://github.com/colingourlay/proper-component/blob/master/src/index.js#L30
function wrapClassComponent(SourceComponent) {
  class WrappedComponent extends SourceComponent {
    render() {
      return merge(super.render(), this.props);
    }
  }

  const ForwardRef = (props, ref) =>
    React.createElement(
      WrappedComponent,
      Object.assign({ ref: typeof ref === "function" ? ref : null }, props)
    );

  WrappedComponent.displayName = ForwardRef.displayName =
    getDisplayName(SourceComponent);

  return React.forwardRef(ForwardRef);
}

function wrapFunctionalComponent(SourceComponent) {
  const wrappedComponent = (props) => {
    return merge(SourceComponent(props), props);
  };

  wrappedComponent.displayName = getDisplayName(SourceComponent);

  return wrappedComponent;
}

const withFSAttributes = (SourceComponent) => {
  // https://github.com/facebook/react/blob/d9e0485c84b45055ba86629dc20870faca9b5973/packages/react-refresh/src/ReactFreshRuntime.js#L144
  const isClassComponent =
    SourceComponent.prototype && SourceComponent.prototype.isReactComponent;

  return hoist(
    (isClassComponent ? wrapClassComponent : wrapFunctionalComponent)(
      SourceComponent
    ),
    SourceComponent
  );
};

export default withFSAttributes;
