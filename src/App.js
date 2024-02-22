import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LayoutMain from "./view/layout/index";
import uris from "./config/uris/uris";
import NPXExcel from "./pages/npx-excel";
import { Provider } from "react-redux";
import reduxStore from "./config/store/redux-store";
import DetectLanguages from "./pages/detect-language";
import Excel from "./pages/excel";
import NpxToJson from "./pages/npx-json";
import '../src/view/layout/styles/global/_styles.scss'
import PDFReader from "./pages/validate-links";

function App() {
  return (
    <Provider store={reduxStore}>
      <Router>
        <LayoutMain>
          <Routes>
            <Route path={uris.npxExcel} element={<NPXExcel />} />
            <Route path={uris.language} element={<DetectLanguages />} />
            <Route path={uris.excel} element={<Excel />} />
            <Route path={uris.npxToJson} element={<NpxToJson />} />
            <Route path={uris.validateLinks} element={<PDFReader />} />
          </Routes>
        </LayoutMain>
      </Router>
    </Provider>
  );
}

export default App;
