import React, { useState, useEffect } from "react";
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from "draft-js";
import "draft-js/dist/Draft.css";
import "./style.css";

const styleMap = {
  'RED_LINE': {
    textDecoration: 'line-through',
    textDecorationColor: 'red',
  },
};

const RichTextEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("editorContent");
    return savedContent
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
      : EditorState.createEmpty();
  });

  useEffect(() => {
    localStorage.setItem("editorContent", JSON.stringify(convertToRaw(editorState.getCurrentContent())));
  }, [editorState]);

  const handleChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleBeforeInput = (chars, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const startKey = selectionState.getStartKey();
    const currentBlock = contentState.getBlockForKey(startKey);
    const text = currentBlock.getText().trim();

    if (chars === " ") {
      if (text === "#") {
        return handleHash(editorState, selectionState, contentState);
      } else if (text === "*") {
        return handleAsterisk(editorState, selectionState, contentState);
      } else if (text === "**") {
        return handleDoubleAsterisk(editorState, selectionState, contentState);
      } else if (text === "***") {
        return handleTripleAsterisk(editorState, selectionState, contentState);
      }
    }

    return "not-handled";
  };

  const handleHash = (editorState, selectionState, contentState) => {
    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: 1
      }),
      " ",
      null
    );

    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      "replace-text"
    );

    newEditorState = RichUtils.toggleBlockType(newEditorState, "header-one");
    setEditorState(newEditorState);
    return "handled";
  };

  const handleAsterisk = (editorState, selectionState, contentState) => {
    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: 1
      }),
      " ",
      null
    );

    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      "replace-text"
    );

    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
    setEditorState(newEditorState);
    return "handled";
  };

  const handleDoubleAsterisk = (editorState, selectionState, contentState) => {
    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: selectionState.getStartOffset() - 2,
        focusOffset: selectionState.getEndOffset()
      }),
      " ",
      null
    );

    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      "replace-text"
    );

    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "RED_LINE");
    setEditorState(newEditorState);
    return "handled";
  };

  const handleTripleAsterisk = (editorState, selectionState, contentState) => {
    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: selectionState.getStartOffset() - 3,
        focusOffset: selectionState.getEndOffset()
      }),
      " ",
      null
    );

    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      "replace-text"
    );

    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE");
    setEditorState(newEditorState);
    return "handled";
  };

  const handleSave = () => {
    localStorage.setItem("editorContent", JSON.stringify(convertToRaw(editorState.getCurrentContent())));
  };

  return (
    <div className="editor-container">
      <div className="header">
        <h2>My Rich Text Editor</h2>
        <button className="save-button" onClick={handleSave}>Save</button>
      </div>
      <div className="editor">
        <Editor
          editorState={editorState}
          onChange={handleChange}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
        />
      </div>
    </div>
  );
}

export default RichTextEditor;
