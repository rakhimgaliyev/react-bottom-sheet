import { useMemo, useRef, useState } from "react";
import { BottomSheetDialog } from "@rakhimgaliyev/react-bottom-sheet";

type DemoCase = "actions" | "scroll" | "horizontal";

export default function App() {
  const [open, setOpen] = useState(false);
  const [demoCase, setDemoCase] = useState<DemoCase>("actions");
  const horizontalRef = useRef<HTMLDivElement>(null);

  const scrollRows = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        title: `Timeline entry ${index + 1}`,
        detail: "Status updated with notes and handoff details.",
      })),
    [],
  );

  return (
    <main className="app">
      <section className="panel">
        <h1>Bottom Sheet Raw Playground</h1>
        <p>Local install via file dependency. Toggle demos and verify behavior on device.</p>
        <div className="controls">
          <button
            className={demoCase === "actions" ? "active" : ""}
            onClick={() => setDemoCase("actions")}
          >
            Quick Actions
          </button>
          <button
            className={demoCase === "scroll" ? "active" : ""}
            onClick={() => setDemoCase("scroll")}
          >
            Long Scroll
          </button>
          <button
            className={demoCase === "horizontal" ? "active" : ""}
            onClick={() => setDemoCase("horizontal")}
          >
            Horizontal
          </button>
        </div>
        <button className="open-btn" onClick={() => setOpen(true)}>
          Open Sheet
        </button>
      </section>

      {demoCase === "actions" ? (
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          header={<Header title="Quick actions" subtitle="Choose one action to continue." />}
          footer={<Footer onClose={() => setOpen(false)} rightLabel="Run selected" />}
        >
          <Card title="Create sprint summary" detail="Generate one-page digest for stakeholders." />
          <Card title="Sync milestones" detail="Push current milestones to planning board." />
          <Card title="Export client update" detail="Collect open tasks and KPIs into PDF." />
          <Card title="Archive notes" detail="Move completed notes to release archive." />
        </BottomSheetDialog>
      ) : null}

      {demoCase === "scroll" ? (
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          header={<Header title="Release timeline" subtitle="Long content stress test." />}
          footer={<Footer onClose={() => setOpen(false)} rightLabel="Close" />}
        >
          {scrollRows.map((row) => (
            <Card key={row.title} title={row.title} detail={row.detail} />
          ))}
        </BottomSheetDialog>
      ) : null}

      {demoCase === "horizontal" ? (
        <BottomSheetDialog
          open={open}
          onOpenChange={setOpen}
          horizontalScrollElRef={horizontalRef}
          header={<Header title="Collections" subtitle="Horizontal list in sheet body." />}
          footer={<Footer onClose={() => setOpen(false)} rightLabel="Apply" />}
        >
          <div ref={horizontalRef} className="h-scroll">
            {["A", "B", "C", "D", "E"].map((item) => (
              <article key={item} className="h-card">
                <h3>Set {item}</h3>
                <p>Palette and layout concept for the next sprint.</p>
              </article>
            ))}
          </div>
          <Card title="Note" detail="Vertical scroll remains active below the carousel." />
          <Card title="Hand-off" detail="Pass selected set to design review." />
        </BottomSheetDialog>
      ) : null}
    </main>
  );
}

function Header(props: { title: string; subtitle: string }) {
  return (
    <div className="sheet-header">
      <h2>{props.title}</h2>
      <p>{props.subtitle}</p>
    </div>
  );
}

function Footer(props: { onClose: () => void; rightLabel: string }) {
  return (
    <div className="sheet-footer">
      <button onClick={props.onClose}>Cancel</button>
      <button onClick={props.onClose}>{props.rightLabel}</button>
    </div>
  );
}

function Card(props: { title: string; detail: string }) {
  return (
    <div className="row">
      <h3>{props.title}</h3>
      <p>{props.detail}</p>
    </div>
  );
}
