# Components

OpenGlass UI provides forty React recipes built from native DOM elements. They
preserve browser semantics, forms, focus, text selection, and assistive
technology access while sharing the `ogui` token and class namespace.

> **Release status:** `open-glass-ui@0.4.0` is published on npm. APIs may still
> change before `1.0.0`.

## Setup

Install the single facade package and import its stylesheet once:

```bash
pnpm add open-glass-ui react react-dom
```

```tsx
import "open-glass-ui/styles.css";
import {
  Button,
  GlassProvider,
  GlassThemeProvider,
  Switch,
} from "open-glass-ui";

export function Preferences() {
  return (
    <GlassProvider>
      <GlassThemeProvider appearance="system">
        <section>
          <Switch
            label="Quiet notifications"
            description="Only alert me for direct mentions."
            defaultChecked
          />
          <Button variant="primary">Save</Button>
        </section>
      </GlassThemeProvider>
    </GlassProvider>
  );
}
```

The `@open-glass-ui/*` workspace packages are implementation boundaries. Normal
consumers and code-generating agents should import from `open-glass-ui`.

## Forty native-DOM recipes

| Category                        | Components                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Actions and selection           | `Button`, `IconButton`, `SegmentedControl`, `Switch`, `Slider`, `ToggleButton`                            |
| Navigation and command surfaces | `Toolbar`, `Dock`, `Tabs`, `Menu`, `MenuItem`, `Popover`, `Tooltip`, `MediaControls`                      |
| Data and identity               | `Badge`, `Avatar`, `AvatarGroup`, `Card`, `Stat`, `Progress`, `Meter`                                     |
| Feedback and status             | `Spinner`, `Skeleton`, `Alert`, `Banner`, `Toast`                                                         |
| Wayfinding and disclosure       | `Breadcrumbs`, `Pagination`, `Accordion`, `Stepper`                                                       |
| Overlays                        | `Dialog`, `Drawer`                                                                                        |
| Forms and input                 | `Checkbox`, `RadioGroup`, `Select`, `TextField`, `Textarea`, `SearchField`, `NumberField`, `FileDropzone` |

The facade also exports the combined `GlassSystemProvider`, the lower-level
React primitives `GlassProvider`, `GlassThemeProvider`, `Glass`, `GlassGroup`,
`GlassSource`, `SdfFilterDefinition`, `OrganicFilterDefinition`, and their
public hooks and types. `GlassSystemProvider` includes the global toast queue;
use `ToastProvider` directly only when composing providers yourself.

## Common conventions

- Components forward appropriate native HTML props unless their public type
  explicitly replaces a conflicting prop.
- Stateful recipes generally support `value`/`defaultValue` and
  `onValueChange`, `open`/`defaultOpen` and `onOpenChange`, or equivalent
  checked/pressed forms.
- Icon-only actions require an accessible name. `IconButton` makes
  `aria-label` mandatory.
- Fields accept a visible `label`; hints, descriptions, and errors are wired to
  the native control.
- `Button` defaults to `type="button"` so it does not submit a form
  accidentally.
- `className` extends the recipe; application code should not replace native
  roles or remove required labels.

## Selection example

```tsx
import { SegmentedControl, Tabs } from "open-glass-ui";

const densityItems = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
] as const;

export function ViewSettings() {
  return (
    <>
      <SegmentedControl
        aria-label="Interface density"
        items={densityItems}
        defaultValue="comfortable"
        onValueChange={(value) => console.log(value)}
      />
      <Tabs
        label="Account sections"
        items={[
          { value: "profile", label: "Profile", content: <p>Profile form</p> },
          {
            value: "security",
            label: "Security",
            content: <p>Security form</p>,
          },
        ]}
      />
    </>
  );
}
```

## Menu and overlays

```tsx
import { Button, Dialog, Menu, MenuItem } from "open-glass-ui";

export function DocumentActions() {
  return (
    <>
      <Menu
        label="Document actions"
        trigger={<Button variant="secondary">Actions</Button>}
      >
        <MenuItem onClick={() => console.log("duplicate")}>Duplicate</MenuItem>
        <MenuItem destructive onClick={() => console.log("delete")}>
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        title="Delete document?"
        description="This action cannot be undone."
        triggerLabel="Open delete confirmation"
      >
        <Button variant="danger">Delete</Button>
      </Dialog>
    </>
  );
}
```

Menus implement arrow-key navigation, Home/End, typeahead, Escape, outside
pointer dismissal, and focus restoration. Dialog and Drawer use a portal,
contain focus while open, close on Escape, lock document scroll, and make
background siblings inert. On close, focus returns to the element that opened
the overlay.

`triggerLabel` is optional. Omit it to drive a Dialog or Drawer entirely
through `open`/`onOpenChange`, with no inline trigger rendered:

```tsx
<Dialog title="Publish material" open={publishing} onOpenChange={setPublishing}>
  Ready to publish.
</Dialog>
```

The `label` passed to `Menu` and `Popover` becomes the trigger's accessible
name. Keep the trigger's visible text inside that label (for example a
"More" button labeled "More actions") so voice-control users can speak what
they see.

Other options worth knowing: `Banner` reports dismissal through `onDismiss`;
`Accordion` accepts `defaultOpenIds` (pass `[]` to start collapsed) and
`headingLevel`; `Card`'s `interactive` prop opts a non-clickable card into the
hover treatment, for example when the card sits inside a link.

## Toast queue

Call `useToast` anywhere below `GlassSystemProvider` to add an accessible,
bounded notification. The queue pauses timed dismissal while a toast is hovered
or focused and supports Escape, actions, explicit dismissal, and zero-duration
persistent notices.

```tsx
import { Button, useToast } from "open-glass-ui";

export function SaveButton() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "Theme saved",
          description: "Neutral contrast settings are now active.",
        })
      }
    >
      Save theme
    </Button>
  );
}
```

## Glass composition

Use glass selectively for controls, navigation, and transient surfaces:

```tsx
import { Button, Toolbar } from "open-glass-ui";

export function EditorToolbar() {
  return (
    <Toolbar label="Editing tools" material="regular">
      <Button variant="quiet">Crop</Button>
      <Button variant="quiet">Adjust</Button>
    </Toolbar>
  );
}
```

Avoid nesting multiple visually heavy glass layers. Do not turn content-dense
articles, tables, or every card into translucent material. The visual effect
must never be required to find, understand, or operate a control.

## Styling contract

- Public runtime prefix: `ogui`.
- Theme variables: `--ogui-color-*` and `--ogui-radius-*`.
- Material variables: `--ogui-material-*`.
- Recipe classes: `.ogui-*`.
- State remains available through native attributes such as `disabled`,
  `aria-pressed`, `aria-selected`, `aria-expanded`, and `data-*` attributes.

Prefer semantic tokens and public props over selectors that depend on internal
element nesting. See [Theming](./THEMING.md) and
[Accessibility](./ACCESSIBILITY.md).
