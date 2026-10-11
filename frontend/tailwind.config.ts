import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // App Neutrals
        app: "var(--bg-app)",
        surface: "var(--bg-surface)",
        subtle: "var(--bg-subtle)",
        muted: "var(--bg-muted)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        // Brand and Semantics
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          accent: "var(--primary-accent)",
          subtle: "var(--primary-subtle)",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "var(--success)",
          subtle: "var(--success-subtle)",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle: "var(--warning-subtle)",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "var(--danger)",
          subtle: "var(--danger-subtle)",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "var(--info)",
          subtle: "var(--info-subtle)",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
        card: "12px",
        modal: "14px",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        caption: ["12px", { lineHeight: "16px" }],
        label: ["13px", { lineHeight: "18px" }],
        body: ["14px", { lineHeight: "22px" }],
        subsection: ["15px", { lineHeight: "22px" }],
        section: ["18px", { lineHeight: "26px" }],
        title: ["24px", { lineHeight: "32px" }],
        kpi: ["30px", { lineHeight: "38px" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        sm: "0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
        overlay: "0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
