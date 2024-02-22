import LayoutMain from "@/view/layout";
import { Provider } from "react-redux";
import reduxStore from "@/config/store/redux-store";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={reduxStore}>
      <LayoutMain>
        <Component {...pageProps} />
      </LayoutMain>
    </Provider>
  )
}
