import { createContext, useEffect, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [recentPrompt2, setRecentPrompt2] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [resultData2, setResultData2] = useState([]);

  // function delayPara(index, nextWord) {
  //     console.log(index, nextWord)
  //     setTimeout(function () {
  //         setResultData(prev => prev + nextWord)
  //         // setResultData2((p) => {
  //         //     const newWord = p[index] + nextWord
  //         //     p[index] = newWord
  //         //     return [...p]
  //         // })
  //     }, 75 * index);
  // }

  // useEffect(() => {
  //     setResultData2(p => {
  //         p[p.length - 1] = resultData
  //         return [...p]
  //     })
  // }, [resultData]);
  //

  const onSent = async (prompt) => {
    // setResultData("")
    setLoading(true);
    setShowResult(true);
    let response;
    if (prompt !== undefined) {
      response = await runChat(prompt);
      setRecentPrompt(prompt);
      setRecentPrompt2((p) => {
        p.push(prompt);
        return [...p];
      });
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      setRecentPrompt2((p) => {
        p.push(input);
        return [...p];
      });
      response = await runChat(input);
    }
    let responseArray = response.split("**");
    let newArray = "";
    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        newArray += responseArray[i];
      } else {
        newArray += "<b>" + responseArray[i] + "</b>";
      }
    }
    console.log(newArray);
    responseArray = newArray.split("*").join("</br>").split(" ");

    let str = "";
    for (let i = 0; i < responseArray.length; i++) {
      const nextWord = responseArray[i];

      str = str + " " + nextWord.toString();
      // delayPara(i, nextWord + " ")

      // setResultData(prev => prev + nextWord)
    }
    // console.log({ str });
    setResultData2((p) => {
      p.push(str);
      return [...p];
    });

    setLoading(false);
    setInput("");
  };

  const newChat = async () => {
    setLoading(false);
    setShowResult(false);
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    setRecentPrompt2,
    recentPrompt,
    recentPrompt2,
    showResult,
    loading,
    resultData,
    resultData2,
    input,
    setInput,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
