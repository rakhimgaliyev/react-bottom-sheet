import type { Meta, StoryObj } from "@storybook/react-vite";
import { BottomSheetDialog } from "@rakhimgaliyev/react-bottom-sheet";
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/newsreader/500.css";
import "@fontsource/newsreader/700.css";

const meta: Meta<typeof BottomSheetDialog> = {
  title: "BottomSheetDialog",
  component: BottomSheetDialog,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof BottomSheetDialog>;

const pageBackground: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 25% 15%, #ffd9b3 0, #ffd9b300 40%), radial-gradient(circle at 75% 8%, #bde7d5 0, #bde7d500 35%), linear-gradient(180deg, #f9f5ef 0%, #ece6df 100%)",
  color: "#1f2328",
  padding: "20px 16px 96px",
  fontFamily: '"Manrope", "Segoe UI", "Helvetica Neue", Helvetica, sans-serif',
};

const shellCard: CSSProperties = {
  borderRadius: 14,
  background: "rgba(255,255,255,0.82)",
  boxShadow: "0 20px 48px rgba(57, 43, 31, 0.12)",
  border: "1px solid rgba(158, 136, 115, 0.25)",
  backdropFilter: "blur(8px)",
  padding: 18,
};

const actionButton: CSSProperties = {
  border: 0,
  borderRadius: 10,
  background: "#1f4f46",
  color: "#f5f8f7",
  fontWeight: 700,
  fontSize: 15,
  padding: "12px 16px",
  cursor: "pointer",
  boxShadow: "0 8px 16px rgba(31,79,70,0.28)",
};

function AppCanvas(props: {
  open: boolean;
  setOpen: (value: boolean) => void;
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const { open, setOpen, children, title, subtitle } = props;

  return (
    <div style={pageBackground}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "grid", gap: 14 }}>
        <div style={shellCard}>
          <div style={{ fontSize: 13, color: "#6d5f4f", marginBottom: 6 }}>
            Mobile Preview
          </div>
          <div
            style={{
              fontSize: 25,
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: 6,
              fontFamily: '"Newsreader", Georgia, "Times New Roman", serif',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 14, color: "#4f4a42", lineHeight: 1.4 }}>{subtitle}</div>
        </div>

        <div style={{ ...shellCard, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13, color: "#7f7568", fontWeight: 700 }}>Today</div>
          <div
            style={{
              background: "#fef9f2",
              border: "1px solid #e5d7c8",
              borderRadius: 10,
              padding: 12,
              fontSize: 14,
              color: "#2f2f2f",
            }}
          >
            Team standup 09:30
          </div>
          <div
            style={{
              background: "#f3f8f6",
              border: "1px solid #d2e5de",
              borderRadius: 10,
              padding: 12,
              fontSize: 14,
              color: "#2f2f2f",
            }}
          >
            Product sync 13:00
          </div>
        </div>

        <button style={actionButton} onClick={() => setOpen(true)}>
          {open ? "Sheet opened" : "Open sheet"}
        </button>
      </div>
      {children}
    </div>
  );
}

function SectionTitle(props: { title: string; subtitle?: string }) {
  const { title, subtitle } = props;
  return (
    <div style={{ padding: "16px 16px 8px" }}>
      <div
        style={{
          fontSize: 23,
          fontWeight: 700,
          lineHeight: 1.08,
          fontFamily: '"Newsreader", Georgia, "Times New Roman", serif',
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div style={{ marginTop: 6, fontSize: 14, color: "#5c5c5c", lineHeight: 1.35 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#ececec", margin: "4px 16px 12px" }} />;
}

function Row(props: { title: string; detail: string; color?: string }) {
  const { title, detail, color = "#f7f7f7" } = props;
  return (
    <div
      style={{
        margin: "0 16px 10px",
        borderRadius: 10,
        padding: "12px 14px",
        background: color,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 3, fontSize: 13, color: "#555" }}>{detail}</div>
    </div>
  );
}

function FooterBar(props: {
  left: string;
  right: string;
  onLeftClick?: () => void;
  onRightClick?: () => void;
}) {
  return (
    <div
      style={{
        borderTop: "1px solid #ececec",
        background: "#fff",
        padding: 12,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}
    >
      <button
        onClick={props.onLeftClick}
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 10,
          padding: "10px 12px",
          background: "#fff",
          color: "#2e2e2e",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {props.left}
      </button>
      <button
        onClick={props.onRightClick}
        style={{
          border: 0,
          borderRadius: 10,
          padding: "10px 12px",
          background: "#174f43",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {props.right}
      </button>
    </div>
  );
}

export const QuickActions: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <AppCanvas
        open={open}
        setOpen={setOpen}
        title="Workflow Center"
        subtitle="A compact action sheet for frequent team operations."
      >
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          header={
            <>
              <SectionTitle title="Quick actions" subtitle="Choose one to continue" />
              <Divider />
            </>
          }
          footer={
            <FooterBar
              left="Close"
              right="Run selected"
              onLeftClick={() => setOpen(false)}
              onRightClick={() => setOpen(false)}
            />
          }
        >
          <Row title="Create sprint summary" detail="Generate a one-page status digest." color="#f5f8ff" />
          <Row title="Schedule release checklist" detail="Build timeline and owner map." color="#f4fbf6" />
          <Row title="Export client update" detail="Prepare executive notes and metrics." color="#fff8f2" />
          <Row title="Sync docs to archive" detail="Push decisions and tasks to records." color="#f8f7ff" />
        </BottomSheetDialog>
      </AppCanvas>
    );
  },
};

export const ScrollableTimeline: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    const items = useMemo(
      () =>
        Array.from({ length: 20 }, (_, index) => ({
          title: `Timeline event ${index + 1}`,
          detail: `Owner updated a milestone and attached design notes for handoff.`,
        })),
      [],
    );

    return (
      <AppCanvas
        open={open}
        setOpen={setOpen}
        title="Release Timeline"
        subtitle="Long content stress test with natural reading rhythm."
      >
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          header={<SectionTitle title="Release timeline" subtitle="Last 20 updates" />}
        >
          <Divider />
          {items.map((item) => (
            <Row key={item.title} title={item.title} detail={item.detail} />
          ))}
        </BottomSheetDialog>
      </AppCanvas>
    );
  },
};

export const CommerceCheckout: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <AppCanvas
        open={open}
        setOpen={setOpen}
        title="Boutique Checkout"
        subtitle="Header, body, and fixed footer interactions."
      >
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          header={<SectionTitle title="Order summary" subtitle="2 items ready for payment" />}
          footer={
            <FooterBar
              left="Add coupon"
              right="Pay $84.00"
              onLeftClick={() => setOpen(false)}
              onRightClick={() => setOpen(false)}
            />
          }
        >
          <Divider />
          <Row title="Linen Overshirt" detail="Sand / M  x1   $52.00" color="#fffaf4" />
          <Row title="Canvas Tote" detail="Olive / One size  x1   $28.00" color="#f7faf5" />
          <div style={{ padding: "4px 16px 18px", fontSize: 14, color: "#4d4d4d", lineHeight: 1.4 }}>
            Delivery estimate: Thu, 12:00-15:00. Taxes and fees included.
          </div>
        </BottomSheetDialog>
      </AppCanvas>
    );
  },
};

export const HorizontalCollections: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    const horizontalScrollElRef = useRef<HTMLDivElement>(null);

    return (
      <AppCanvas
        open={open}
        setOpen={setOpen}
        title="Content Studio"
        subtitle="Horizontal carousel inside sheet with vertical scroll outside."
      >
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          horizontalScrollElRef={horizontalScrollElRef}
          header={<SectionTitle title="Collections" subtitle="Swipe sideways through visual sets" />}
        >
          <Divider />
          <div
            ref={horizontalScrollElRef}
            style={{
              overflowX: "auto",
              display: "flex",
              gap: 12,
              padding: "0 16px 10px",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {["#d6e8f8", "#e7f6d6", "#f9e0d1", "#e9dcf7", "#d5f2ed"].map((color, index) => (
              <div
                key={color}
                style={{
                  flex: "0 0 220px",
                  borderRadius: 12,
                  background: color,
                  border: "1px solid rgba(0,0,0,0.08)",
                  padding: 14,
                  minHeight: 132,
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontSize: 12, color: "#4e4e4e" }}>Set {index + 1}</div>
                <div style={{ marginTop: 6, fontWeight: 700, fontSize: 16 }}>Editorial concept</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#4f4f4f", lineHeight: 1.35 }}>
                  Palette, typography, and layout cues prepared for next sprint.
                </div>
              </div>
            ))}
          </div>
          <Row title="Notes" detail="Vertical scrolling stays responsive below the carousel." />
          <Row title="Hand-off" detail="Pass selected collection to design review board." />
        </BottomSheetDialog>
      </AppCanvas>
    );
  },
};

export const TeamDirectory: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <AppCanvas
        open={open}
        setOpen={setOpen}
        title="Team Directory"
        subtitle="Dense list view to validate scanability and spacing."
      >
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          header={<SectionTitle title="People" subtitle="Active projects and availability" />}
        >
          <Divider />
          <Row title="Ari Lambert" detail="Growth team  •  Available now" color="#f5fbf7" />
          <Row title="Samir Khan" detail="Platform team  •  In focus mode" color="#f7f8fd" />
          <Row title="Maya Patel" detail="Design systems  •  In meeting" color="#fff8f2" />
          <Row title="Lena Rossi" detail="Operations  •  Available in 20 min" color="#f5fafc" />
          <Row title="Jon Park" detail="Analytics  •  Reviewing dashboards" color="#f9f6ff" />
          <Row title="Lia Costa" detail="Mobile team  •  Pair programming" color="#f7faf4" />
          <div style={{ height: 10 }} />
        </BottomSheetDialog>
      </AppCanvas>
    );
  },
};

export const SettingsForm: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <AppCanvas
        open={open}
        setOpen={setOpen}
        title="Workspace Settings"
        subtitle="Form-like layout and mixed controls in scrollable body."
      >
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          header={<SectionTitle title="Notification settings" subtitle="Tune workspace alerts" />}
          footer={
            <FooterBar
              left="Reset"
              right="Save changes"
              onLeftClick={() => setOpen(false)}
              onRightClick={() => setOpen(false)}
            />
          }
        >
          <Divider />
          <div style={{ padding: "0 16px 8px", display: "grid", gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#3d3d3d" }}>
              Daily summary time
              <input
                defaultValue="08:30"
                style={{
                  width: "100%",
                  marginTop: 6,
                  borderRadius: 10,
                  border: "1px solid #d6d6d6",
                  padding: "10px 12px",
                  fontSize: 14,
                }}
              />
            </label>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#3d3d3d" }}>
              Escalation channel
              <input
                defaultValue="#release-war-room"
                style={{
                  width: "100%",
                  marginTop: 6,
                  borderRadius: 10,
                  border: "1px solid #d6d6d6",
                  padding: "10px 12px",
                  fontSize: 14,
                }}
              />
            </label>
            <Row title="Digest emails" detail="Enabled for critical incidents only." color="#f6faf8" />
            <Row title="Push alerts" detail="Muted between 21:00 and 07:00." color="#f8f8ff" />
          </div>
        </BottomSheetDialog>
      </AppCanvas>
    );
  },
};
