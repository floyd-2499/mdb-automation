import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from "react-redux";

import '../src/view/layout/styles/global/_styles.scss'
import reduxStore from "./config/store/redux-store";
import uris from "./config/uris/uris";
import PermIdDetails from "./pages/permid";
import Home from "./pages/home";
import Excel from "./pages/excel";
import NPXExcelMain from "./pages/npx-excel";
import DetectLanguages from "./pages/detect-language";
import NpxToJson from "./pages/npx-json";
import PDFReader from "./pages/validate-links";
import ColorExcel from "./pages/color-validation";
import FieldCalculations from "./pages/field-calculations";
import LayoutMain from "./view/layout/index";
import PdfCompressor from "./pages/pdf-helper";

function App() {
  return (
    <Provider store={reduxStore}>
      <Router>
        <LayoutMain>
          <Routes>
            <Route path={uris.home} element={<Home />} />
            <Route path={uris.npxExcel} element={<NPXExcelMain />} />
            <Route path={uris.language} element={<DetectLanguages />} />
            <Route path={uris.excel} element={<Excel />} />
            <Route path={uris.npxToJson} element={<NpxToJson />} />
            <Route path={uris.validateLinks} element={<PDFReader />} />
            <Route path={uris.colorExcel} element={<ColorExcel />} />
            <Route path={uris.fieldCalculations} element={<FieldCalculations />} />
            <Route path={uris.permid} element={<PermIdDetails />} />
            <Route path={uris.pdfCompress} element={<PdfCompressor />} />
          </Routes>
        </LayoutMain>
      </Router>
    </Provider>
  );
}

export default App;
