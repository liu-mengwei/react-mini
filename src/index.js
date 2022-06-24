import "./index.css";
import MiReact from "./MiReact";

/** @jsx MiReact.createElement */
function Text({ text }) {
  const [subTitle, setSubTitle] = MiReact.useState("subTitle");

  MiReact.useEffect(() => {
    setSubTitle(text);
  }, [text]);

  return (
    <div>
      {text}
      {subTitle}
    </div>
  );
}

function App() {
  const [visible, setVisible] = MiReact.useState(true);

  MiReact.useEffect(() => {
    if (visible) {
      console.log("么么哒");
    }

    return () => {
      console.log("卸载么么哒");
    };
  });

  return (
    // <div>
    //   <button
    //     onClick={() => {
    //       setVisible(!visible);
    //     }}
    //   >
    //     toggle
    //   </button>
    //   {visible && <Text text={"么么"} />}
    //   <Text text="hello" />
    // </div>
    <Text text="hello" />
  );
}

const container = document.querySelector("#root");
MiReact.render(<App />, container);
