import MiReact from "./MiReact";

/** @jsx MiReact.createElement */
function Text({ text, visible = false }) {
  const [subTitle, setSubTitle] = MiReact.useState("subTitle");
  const [subTitle2, setSubTitle2] = MiReact.useState("subTitle2");

  MiReact.useEffect(() => {
    setSubTitle("subTitle展示" + Math.random());

    return () => {
      console.log("卸载");
    };
  }, [text]);

  MiReact.useEffect(() => {
    if (visible) {
      setSubTitle2("subTitle2展示" + Math.random());
    }
  }, [visible]);

  return (
    <div>
      subTitle :{subTitle}
      <br />
      subTitle2 :{subTitle2}
    </div>
  );
}

function App() {
  const [visible, setVisible] = MiReact.useState(false);
  const [text, setText] = MiReact.useState("hello");

  return (
    <div>
      <button
        onClick={() => {
          setVisible(!visible);
          setText("toggle" + Math.random());
        }}
      >
        toggle
      </button>
      <Text text="么么" />
      <Text text={text} visible={visible} />
    </div>
  );
}

const container = document.querySelector("#root");
MiReact.render(<App />, container);
