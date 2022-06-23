import "./index.css";
import MiReact from "./MiReact";

/** @jsx MiReact.createElement */
function Text({ text }) {
  return <span>{text}</span>;
}

function App() {
  const [visible, setVisible] = MiReact.useState(false);

  MiReact.useEffect(() => {
    if (visible) {
      console.log("么么哒");
    }

    return () => {
      console.log("卸载么么哒");
    };
  });

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
