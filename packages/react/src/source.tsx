import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useRef,
} from "react";

export interface GlassGroupRuntime {
  id: string;
  sourceRef: MutableRefObject<HTMLElement | null>;
}

export interface GlassGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  id?: string;
}

export interface GlassSourceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const GlassGroupContext = createContext<GlassGroupRuntime | null>(null);

function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

export const GlassGroup = forwardRef<HTMLDivElement, GlassGroupProps>(function GlassGroup(
  { children, id, ...rest },
  ref,
) {
  const reactId = useId();
  const sourceRef = useRef<HTMLElement | null>(null);
  const groupId = safeId(id ?? `prism-group-${reactId}`);
  const value = useMemo(() => ({ id: groupId, sourceRef }), [groupId]);

  return (
    <GlassGroupContext.Provider value={value}>
      <div {...rest} ref={ref} data-prism-group={groupId}>
        {children}
      </div>
    </GlassGroupContext.Provider>
  );
});

export const GlassSource = forwardRef<HTMLDivElement, GlassSourceProps>(function GlassSource(
  { children, ...rest },
  forwardedRef,
) {
  const group = useContext(GlassGroupContext);

  return (
    <div
      {...rest}
      ref={(element) => {
        if (group) {
          group.sourceRef.current = element;
        }
        if (typeof forwardedRef === "function") {
          forwardedRef(element);
        } else if (forwardedRef) {
          forwardedRef.current = element;
        }
      }}
      data-prism-source={group?.id ?? ""}
    >
      {children}
    </div>
  );
});

export function useGlassGroup() {
  return useContext(GlassGroupContext);
}
