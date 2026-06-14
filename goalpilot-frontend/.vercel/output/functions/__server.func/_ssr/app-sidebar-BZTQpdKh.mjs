import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState, d as useNavigate, L as Link, u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as cn, I as Input, B as Button } from "./input-BiB-PFhx.mjs";
import { R as Root$2 } from "../_libs/radix-ui__react-separator.mjs";
import { R as Root, T as Trigger, P as Portal, C as Content, a as Close, b as Title, D as Description, O as Overlay } from "../_libs/radix-ui__react-dialog.mjs";
import { P as Provider, R as Root3, T as Trigger$1, a as Portal$1, C as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { s as supabase } from "./client-hQzx3ycp.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Root$1, V as Viewport, C as Corner, S as ScrollAreaScrollbar, a as ScrollAreaThumb } from "../_libs/radix-ui__react-scroll-area.mjs";
import { a as useUserState, u as userState, g as getApiUrl } from "./api-config-CUXI1WgJ.mjs";
import { L as Label } from "./label-D4W0VQAM.mjs";
import { S as Select$1, a as SelectValue$1, b as SelectTrigger$1, c as SelectIcon, d as SelectPortal, e as SelectContent$1, f as SelectViewport, g as SelectItem$1, h as SelectItemIndicator, i as SelectItemText, j as SelectScrollUpButton$1, k as SelectScrollDownButton$1, l as SelectLabel$1, m as SelectSeparator$1 } from "../_libs/radix-ui__react-select.mjs";
import { t as LayoutDashboard, N as Network, K as Kanban, o as Calendar, d as Plus, T as Target, u as Settings, v as LogOut, e as LoaderCircle, w as PanelLeft, X, x as ChevronDown, r as Check, S as Sparkles, y as Bot, U as User, R as RefreshCw, z as Send, D as ChevronUp } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const Separator = reactExports.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root$2,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    ),
    ...props
  }
));
Separator.displayName = Root$2.displayName;
const Sheet = Root;
const SheetTrigger = Trigger;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
const TooltipProvider = Provider;
const Tooltip = Root3;
const TooltipTrigger = Trigger$1;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = Content2.displayName;
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = reactExports.createContext(null);
function useSidebar() {
  const context = reactExports.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
const SidebarProvider = reactExports.forwardRef(
  ({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = reactExports.useState(false);
    const [_open, _setOpen] = reactExports.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = reactExports.useCallback(
      (value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );
    const toggleSidebar = reactExports.useCallback(() => {
      return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
    }, [isMobile, setOpen, setOpenMobile]);
    reactExports.useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);
    const state = open ? "expanded" : "collapsed";
    const contextValue = reactExports.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style
        },
        className: cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
          className
        ),
        ref,
        ...props,
        children
      }
    ) }) });
  }
);
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = reactExports.forwardRef(
  ({
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    if (collapsible === "none") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
            className
          ),
          ref,
          ...props,
          children
        }
      );
    }
    if (isMobile) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        SheetContent,
        {
          "data-sidebar": "sidebar",
          "data-mobile": "true",
          className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
          style: {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE
          },
          side,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "sr-only", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Sidebar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: "Displays the mobile sidebar." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full flex-col", children })
          ]
        }
      ) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref,
        className: "group peer hidden text-sidebar-foreground md:block",
        "data-state": state,
        "data-collapsible": state === "collapsed" ? collapsible : "",
        "data-variant": variant,
        "data-side": side,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
                "group-data-[collapsible=offcanvas]:w-0",
                "group-data-[side=right]:rotate-180",
                variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
                side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                // Adjust the padding for floating and inset variants.
                variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                className
              ),
              ...props,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  "data-sidebar": "sidebar",
                  className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
                  children
                }
              )
            }
          )
        ]
      }
    );
  }
);
Sidebar.displayName = "Sidebar";
const SidebarTrigger = reactExports.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      ref,
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: cn("h-7 w-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeft, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        ref,
        "data-sidebar": "rail",
        "aria-label": "Toggle Sidebar",
        tabIndex: -1,
        onClick: toggleSidebar,
        title: "Toggle Sidebar",
        className: cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className
        ),
        ...props
      }
    );
  }
);
SidebarRail.displayName = "SidebarRail";
const SidebarInset = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "main",
      {
        ref,
        className: cn(
          "relative flex w-full flex-1 flex-col bg-background",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          className
        ),
        ...props
      }
    );
  }
);
SidebarInset.displayName = "SidebarInset";
const SidebarInput = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Input,
    {
      ref,
      "data-sidebar": "input",
      className: cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      ),
      ...props
    }
  );
});
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        "data-sidebar": "header",
        className: cn("flex flex-col gap-2 p-2", className),
        ...props
      }
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        "data-sidebar": "footer",
        className: cn("flex flex-col gap-2 p-2", className),
        ...props
      }
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Separator,
    {
      ref,
      "data-sidebar": "separator",
      className: cn("mx-2 w-auto bg-sidebar-border", className),
      ...props
    }
  );
});
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        "data-sidebar": "content",
        className: cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className
        ),
        ...props
      }
    );
  }
);
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        "data-sidebar": "group",
        className: cn("relative flex w-full min-w-0 flex-col p-2", className),
        ...props
      }
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = reactExports.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-label",
      className: cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = reactExports.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-action",
      className: cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      "data-sidebar": "group-content",
      className: cn("w-full text-sm", className),
      ...props
    }
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  )
);
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "li",
    {
      ref,
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const SidebarMenuButton = reactExports.forwardRef(
  ({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();
    const button = /* @__PURE__ */ jsxRuntimeExports.jsx(
      Comp,
      {
        ref,
        "data-sidebar": "menu-button",
        "data-size": size,
        "data-active": isActive,
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
        ...props
      }
    );
    if (!tooltip) {
      return button;
    }
    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip
      };
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: button }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TooltipContent,
        {
          side: "right",
          align: "center",
          hidden: state !== "collapsed" || isMobile,
          ...tooltip
        }
      )
    ] });
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = reactExports.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-action",
      className: cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      "data-sidebar": "menu-badge",
      className: cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = reactExports.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  const width = reactExports.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref,
      "data-sidebar": "menu-skeleton",
      className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
      ...props,
      children: [
        showIcon && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "size-4 rounded-md", "data-sidebar": "menu-skeleton-icon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Skeleton,
          {
            className: "h-4 max-w-(--skeleton-width) flex-1",
            "data-sidebar": "menu-skeleton-text",
            style: {
              "--skeleton-width": width
            }
          }
        )
      ]
    }
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu-sub",
      className: cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = reactExports.forwardRef(
  ({ ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { ref, ...props })
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = reactExports.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
const ScrollArea = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root$1,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollBar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Corner, {})
    ]
  }
));
ScrollArea.displayName = Root$1.displayName;
const ScrollBar = reactExports.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
function FocusCoach({ collapsed }) {
  const [open, setOpen] = reactExports.useState(false);
  const [messages, setMessages] = reactExports.useState([
    { role: "assistant", content: "Hello! I am your GoalPilot Focus Coach. I can help you schedule, add tasks, mark milestones completed, or optimize your calendar. How can I help you today?" }
  ]);
  const [input, setInput] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const scrollRef = reactExports.useRef(null);
  const router = useRouter();
  reactExports.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const sendMessage = async (textToSend) => {
    if (!textToSend.trim() || sending) return;
    const userMsg = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      const token = userState.token;
      if (!token) {
        toast.error("Authentication expired. Please log in again.");
        return;
      }
      const historyToSend = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content
      }));
      const res = await fetch(getApiUrl("chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyToSend
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Coach failed to reply.");
      }
      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.content };
      setMessages((prev) => [...prev, assistantMsg]);
      router.invalidate();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to send message to Focus Coach.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into a connection issue. Please make sure the backend Python server is running locally on port 8000." }
      ]);
    } finally {
      setSending(false);
    }
  };
  const handleQuickAction = (actionText) => {
    sendMessage(actionText);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md hover:bg-white/5 transition text-sm text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary-glow animate-pulse shrink-0" }),
      !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Focus Coach" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "glass-strong border-border text-foreground flex flex-col h-full w-[400px] sm:w-[480px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "border-b border-border pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "flex items-center gap-2 text-xl font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary-glow" }),
          " Focus Coach"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { className: "text-xs text-muted-foreground", children: "GoalPilot's AI Coach. Manage tasks and reschedule your calendar in natural language." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 my-4 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: messages.map((m, idx) => {
          const isBot = m.role === "assistant";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              className: `flex items-start gap-2.5 ${!isBot ? "flex-row-reverse" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs border ${isBot ? "bg-primary/10 border-primary/20 text-primary-glow" : "bg-white/5 border-border text-muted-foreground"}`, children: isBot ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-2xl px-4 py-2.5 max-w-[80%] text-xs leading-relaxed ${isBot ? "bg-background/40 border border-border text-foreground rounded-tl-none" : "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-tr-none shadow-[0_2px_10px_rgba(168,85,247,0.1)]"}`, children: m.content })
              ]
            },
            idx
          );
        }) }),
        sending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20 text-primary-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl px-4 py-2.5 bg-background/40 border border-border rounded-tl-none flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-primary-glow" }),
            " Focus Coach is thinking..."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-2 border-t border-border pt-4 scrollbar-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => handleQuickAction("Reschedule all my tasks"),
            className: "text-[10px] h-7 border-border hover:bg-white/5 shrink-0 flex gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-2.5 w-2.5 text-primary-glow" }),
              " Reschedule Calendar"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => handleQuickAction("List all my tasks"),
            className: "text-[10px] h-7 border-border hover:bg-white/5 shrink-0 flex gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-2.5 w-2.5 text-primary-glow" }),
              " Show Agenda"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => handleQuickAction("Add a task to write tests"),
            className: "text-[10px] h-7 border-border hover:bg-white/5 shrink-0 flex gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-2.5 w-2.5 text-primary-glow" }),
              " Add task"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            sendMessage(input);
          },
          className: "flex gap-2 pt-2 border-t border-border",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: input,
                onChange: (e) => setInput(e.target.value),
                placeholder: "Ask Focus Coach...",
                disabled: sending,
                className: "bg-background/40 text-xs h-10 border-border"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                size: "icon",
                disabled: sending || !input.trim(),
                className: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
              }
            )
          ]
        }
      )
    ] })
  ] });
}
const Dialog = Root;
const DialogTrigger = Trigger;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
const Select = Select$1;
const SelectValue = SelectValue$1;
const SelectTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SelectTrigger$1,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectIcon, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectTrigger$1.displayName;
const SelectScrollUpButton = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectScrollUpButton$1,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
const SelectScrollDownButton = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectScrollDownButton$1,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
const SelectContent = reactExports.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SelectContent$1,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SelectViewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectContent$1.displayName;
const SelectLabel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectLabel$1,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectLabel$1.displayName;
const SelectItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SelectItem$1,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItemIndicator, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectItem$1.displayName;
const SelectSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectSeparator$1,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectSeparator$1.displayName;
const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Knowledge Graph", url: "/knowledge-graph", icon: Network },
  { title: "Kanban Board", url: "/kanban", icon: Kanban },
  { title: "Calendar", url: "/calendar", icon: Calendar }
];
function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, token, activeGoalId, allMissions } = useUserState();
  const [isOpenPersonaSettings, setIsOpenPersonaSettings] = reactExports.useState(false);
  const [profileData, setProfileData] = reactExports.useState({
    display_name: "",
    focus_area: "",
    daily_hours: 2,
    work_style: "Deep Work",
    user_level: "Beginner"
  });
  const [loadingProfile, setLoadingProfile] = reactExports.useState(false);
  const [savingProfile, setSavingProfile] = reactExports.useState(false);
  const fetchProfile = async () => {
    if (!userId) return;
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase.from("profiles").select("display_name, focus_area, current_focus, daily_hours, work_style, user_level").eq("id", userId).maybeSingle();
      if (error) throw error;
      if (data) {
        setProfileData({
          display_name: data.display_name || "",
          focus_area: data.focus_area || data.current_focus || "",
          daily_hours: data.daily_hours || 2,
          work_style: data.work_style || "Deep Work",
          user_level: data.user_level || "Beginner"
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile data.");
    } finally {
      setLoadingProfile(false);
    }
  };
  reactExports.useEffect(() => {
    if (isOpenPersonaSettings) {
      fetchProfile();
    }
  }, [isOpenPersonaSettings]);
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setSavingProfile(true);
    try {
      const res = await fetch(getApiUrl("complete-onboarding"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          user_id: userId,
          full_name: profileData.display_name,
          preferences: {
            focus_area: profileData.focus_area,
            daily_hours: Number(profileData.daily_hours),
            work_style: profileData.work_style,
            user_level: profileData.user_level
          }
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update persona.");
      }
      toast.success("Persona updated successfully!");
      setIsOpenPersonaSettings(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save persona settings.");
    } finally {
      setSavingProfile(false);
    }
  };
  reactExports.useEffect(() => {
    if (!userId || !token) return;
    const fetchGoals = async () => {
      try {
        const res = await fetch(getApiUrl("user-goals"), {
          headers: userState.getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          userState.setAllMissions(data);
          if (data.length > 0 && !activeGoalId) {
            const defaultGoal = data[0];
            userState.setActiveGoalId(defaultGoal.id);
            await supabase.from("profiles").update({ last_active_goal_id: defaultGoal.id }).eq("id", userId);
          }
        }
      } catch (e) {
        console.error("Failed to load goals in sidebar:", e);
      }
    };
    fetchGoals();
  }, [userId, token, activeGoalId]);
  const handleSelectGoal = async (goalId) => {
    userState.setActiveGoalId(goalId);
    if (userId) {
      const { error } = await supabase.from("profiles").update({ last_active_goal_id: goalId }).eq("id", userId);
      if (error) {
        toast.error("Failed to update active goal session.");
      } else {
        toast.success("Active mission updated!");
      }
    }
  };
  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Sidebar, { collapsible: "icon", className: "border-r border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarHeader, { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2 px-2 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow btn-glow shrink-0" }),
      !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tracking-tight", children: "GoalPilot" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupLabel, { children: "Workspace" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenu, { children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuButton, { asChild: true, isActive: pathname === item.url, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: item.url, className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-4 w-4" }),
          !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.title })
        ] }) }) }, item.title)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroupLabel, { className: "flex justify-between items-center pr-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "My Missions" }),
          !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "h-5 w-5 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer border-0 bg-transparent text-primary-glow",
              onClick: () => window.location.href = "/onboarding?new=true",
              title: "Create New Mission",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenu, { children: allMissions.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          SidebarMenuButton,
          {
            isActive: activeGoalId === g.id,
            onClick: () => handleSelectGoal(g.id),
            className: "w-full text-left justify-start gap-2 px-3 py-1.5 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: `h-4 w-4 shrink-0 ${activeGoalId === g.id ? "text-primary-glow animate-pulse" : "text-muted-foreground"}` }),
              !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: g.title })
            ]
          }
        ) }, g.id)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupLabel, { children: "AI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenu, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuButton, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FocusCoach, { collapsed }) }) }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFooter, { className: "border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        SidebarMenuButton,
        {
          onClick: async () => {
            const token2 = userState.token;
            if (!token2) {
              toast.error("Not authenticated");
              return;
            }
            try {
              const res = await fetch(getApiUrl(`google-login?supabase_token=${token2}`), {
                headers: userState.getAuthHeaders()
              });
              if (!res.ok) {
                throw new Error("Failed to get authorization URL");
              }
              const data = await res.json();
              if (data.url) {
                window.open(data.url, "_blank");
              } else {
                toast.error("Google Login URL not found.");
              }
            } catch (err) {
              toast.error("Could not connect to backend server.");
            }
          },
          className: "flex items-center gap-2 text-muted-foreground hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-primary-glow" }),
            !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Connect Google Calendar" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        SidebarMenuButton,
        {
          onClick: () => setIsOpenPersonaSettings(true),
          className: "flex items-center gap-2 text-muted-foreground hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 text-primary-glow" }),
            !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Persona Settings" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenuButton, { onClick: handleSignOut, className: "flex items-center gap-2 text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
        !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign out" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpenPersonaSettings, onOpenChange: setIsOpenPersonaSettings, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "glass-strong border border-border text-foreground max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveProfile, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6 text-primary-glow" }),
          " Persona Settings"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-muted-foreground text-sm", children: "Fine-tune your personal execution engine settings. Changing these settings will update how the AI Coach schedules and scales your roadmap tasks." })
      ] }),
      loadingProfile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary-glow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Loading profile details..." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "display-name", className: "text-sm font-medium", children: "Full Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "display-name",
              value: profileData.display_name,
              onChange: (e) => setProfileData({ ...profileData, display_name: e.target.value }),
              required: true,
              className: "bg-background/40"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "focus-area", className: "text-sm font-medium", children: "Focus Area" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "focus-area",
              value: profileData.focus_area,
              onChange: (e) => setProfileData({ ...profileData, focus_area: e.target.value }),
              required: true,
              className: "bg-background/40"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "daily-hours", className: "text-sm font-medium", children: "Daily Hours Quota" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "daily-hours",
              type: "number",
              min: "1",
              max: "24",
              value: profileData.daily_hours,
              onChange: (e) => setProfileData({ ...profileData, daily_hours: Number(e.target.value) }),
              required: true,
              className: "bg-background/40"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "work-style", className: "text-sm font-medium", children: "Work Style" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: profileData.work_style,
              onValueChange: (val) => setProfileData({ ...profileData, work_style: val }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "work-style", className: "bg-background/40 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select work style" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "glass-strong text-foreground border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Deep Work", children: "Deep Work" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pomodoro", children: "Pomodoro" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Time Boxing", children: "Time Boxing" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "user-level", className: "text-sm font-medium", children: "Experience Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: profileData.user_level,
              onValueChange: (val) => setProfileData({ ...profileData, user_level: val }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "user-level", className: "bg-background/40 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select level" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "glass-strong text-foreground border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Beginner", children: "Beginner" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Intermediate", children: "Intermediate" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Expert", children: "Expert" })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            onClick: () => setIsOpenPersonaSettings(false),
            disabled: savingProfile,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            disabled: loadingProfile || savingProfile,
            className: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow",
            children: savingProfile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
              " Saving..."
            ] }) : "Save Changes"
          }
        )
      ] })
    ] }) }) })
  ] });
}
export {
  AppSidebar as A,
  Dialog as D,
  SidebarProvider as S,
  SidebarTrigger as a,
  DialogTrigger as b,
  DialogContent as c,
  DialogHeader as d,
  DialogTitle as e,
  Select as f,
  SelectTrigger as g,
  SelectValue as h,
  SelectContent as i,
  SelectItem as j,
  DialogDescription as k,
  DialogFooter as l
};
