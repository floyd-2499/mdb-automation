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
import Home from "./pages/home";
import ColorExcel from "./pages/color-validation";
import FieldCalculations from "./pages/field-calculations";

function App() {
  return (
    <Provider store={reduxStore}>
      <Router>
        <LayoutMain>
          <Routes>
            <Route path={uris.home} element={<Home />} />
            <Route path={uris.npxExcel} element={<NPXExcel />} />
            <Route path={uris.language} element={<DetectLanguages />} />
            <Route path={uris.excel} element={<Excel />} />
            <Route path={uris.npxToJson} element={<NpxToJson />} />
            <Route path={uris.validateLinks} element={<PDFReader />} />
            <Route path={uris.colorExcel} element={<ColorExcel />} />
            <Route path={uris.fieldCalculations} element={<FieldCalculations />} />
          </Routes>
        </LayoutMain>
      </Router>
    </Provider>
  );
}

export default App;
