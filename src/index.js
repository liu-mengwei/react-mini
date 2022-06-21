import "./index.css";
import MiReact from "./MiReact";

/** @jsx MiReact.createElement */
function Text({ text }) {
  return <span>{text}</span>;
}

function App() {
  const [visible, setVisible] = MiReact.useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setVisible(!visible);
        }}
      >
        toggle
      </button>
      {visible && <Text text={"么么哒"} />}
    </div>
  );
}

const container = document.querySelector("#root");
MiReact.render(<App />, container);
