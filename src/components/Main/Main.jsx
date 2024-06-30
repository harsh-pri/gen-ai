import React, { useContext, useEffect, useRef, useState } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";

const Main = () => {
  const {
    onSent,
    recentPrompt,
    recentPrompt2,
    setRecentPrompt2,
    showResult,
    loading,
    resultData,
    resultData2,
    setInput,
    input,
  } = useContext(Context);

  const [fileText, setFileText] = useState("");
  const [fileConverted, setFileConverted] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [prd, setPrd] = useState("");
  const [fileName, setFileName] = useState(""); // State to hold selected file name

  const ref = useRef(null);

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    const objDiv = ref.current;
    if (objDiv) {
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }, [resultData2, recentPrompt2]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name); // Set the selected file name
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        if (file.type === "application/pdf") {
          extractTextFromPDF(arrayBuffer);
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          extractTextFromDOCX(arrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const extractTextFromPDF = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      extractedText += `${pageText}`;
    }
    setFileText(extractedText);
    const input =
      extractedText +
      "create a detailed Product requirement document which contains it sub feature to help out developer team and business team understand the requirements. So that development team can understand their tasks, in around 600 words in a formatted way in HTML format";
    setInput(input);
  };

  const extractTextFromDOCX = async (arrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    setFileText(result.value);

    const input =
      result.value +
      "create a detailed Product requirement document which contains it sub feature to help out developer team and business team understand the requirements. So that development team can understand their tasks, in around 600 words in a formatted way in HTML format";
    setInput(input);
  };

  const handleSend = () => {
    setFileUploaded(true);
    onSent().then(() => {
      if (!fileConverted) {
        setPrd(resultData2);
      }
      setFileConverted(true);
    });
  };

  const downloadAsPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = prd.join("<br/>");

    const opt = {
      margin: 1,
      filename: "prd.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="main">
      <div className="nav">
        <p className="cursor-pointer" onClick={handleRefresh}>
          CodeCrafter
        </p>
        <img src={assets.user_icon} alt="" />
      </div>
      <div className="main-container">
        {showResult ? (
          <div className="result" ref={ref} id="pdfContent">
            {recentPrompt2.map((i, index) => (
              <React.Fragment key={index}>
                <div className="result-title">
                  <img src={assets.user_icon} alt="" />
                  {index === 0 ? <p>{"Converting BRD to PRD"}</p> : <p>{i}</p>}
                </div>
                <div className="result-data">
                  <img src={assets.gemini_icon} alt="" />
                  {loading && resultData2.length === index ? (
                    <div className="loader">
                      <hr className="animated-bg" />
                      <hr className="animated-bg" />
                      <hr className="animated-bg" />
                    </div>
                  ) : (
                    <p
                      dangerouslySetInnerHTML={{
                        __html: resultData2[index],
                      }}
                    ></p>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <>
            <div className="greet">
              <p>
                <span>Hello, Primathon.</span>
              </p>
              <p>I am here to convert BRD to PRD</p>
            </div>
          </>
        )}

        {fileConverted && (
          <div className="download-buttons">
            <button onClick={downloadAsPDF}>Download as PDF</button>
          </div>
        )}

        <div className="main-bottom">
          {!fileConverted ? (
            !fileUploaded && (
              <div className="file-upload">
                <label className="upload-button">
                  {fileName ? fileName : "Choose File"}
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                  />
                </label>

                {fileText && (
                  <img
                    onClick={handleSend}
                    src={assets.send_icon}
                    width={30}
                    alt=""
                  />
                )}
              </div>
            )
          ) : (
            <div className="search-box">
              <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                type="text"
                placeholder="Enter a prompt here"
              />
              <div>
                {input ? (
                  <img
                    onClick={handleSend}
                    src={assets.send_icon}
                    width={30}
                    alt=""
                  />
                ) : null}
              </div>
            </div>
          )}
          <p className="bottom-info">
            CodeCrafter may display inaccurate info, including about people, so
            double-check its responses. Your privacy and CodeCrafter Apps
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
