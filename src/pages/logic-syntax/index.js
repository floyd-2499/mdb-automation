import React, { useEffect, useState } from "react";

import Select from 'react-select'
import { FaChevronUp, FaChevronDown, FaTrash } from "react-icons/fa6"

import "./styles.scss";

const syntaxOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'and', label: 'And' },
    { value: 'or', label: 'Or' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'greaterThanOrEquals', label: 'Greater Than Or Equals' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'lessThanOrEquals', label: 'Less Than Or Equals' },
]

const elementScoreOptions = [
    { value: 'Met', label: 'Met' },
    { value: 'Unmet', label: 'Unmet' },
    { value: 'Partially Met', label: 'Partially Met' },
]

const FieldWrapper = ({ children, label }) => {
    return (
        <div className="field-wrapper">
            <div className="label">{label}</div>
            <div className="field">{children}</div>
        </div>
    )
}

const LogicSubComponent = ({ data, onDeleteChild, onAddChild, updateTreeValue }) => {
    const [syntax, setSyntax] = useState(null)
    const [var1, setVar1] = useState("")
    const [var2, setVar2] = useState("")
    const [extendLogic, setExtendLogic] = useState(false)

    const onChangeSyntax = (value) => {
        setSyntax(value)
        updateTreeValue(data.key, { syntax: value });
    }

    const onChangeVar1 = (e) => {
        const newValue = e?.target?.value;
        setVar1(newValue);
        updateTreeValue(data.key, { var1: newValue });
    }

    const onChangeVar2 = (e) => {
        const newValue = e?.target?.value;
        setVar2(newValue);
        updateTreeValue(data.key, { var2: newValue });
    }

    const onExtend = () => {
        setExtendLogic(!extendLogic)
    }

    return (
        <div className="logic-component-container sub-component">
            <div className="logic-title-wrapper" onClick={onExtend}>
                <div className="title-main">
                    <h3>{data?.title}</h3>
                    <div className="row" />
                    <div className="icons-wrapper" >{!extendLogic ? <FaChevronDown /> : <FaChevronUp />}</div>
                </div>
                <FaTrash className="delete-icon" onClick={() => onDeleteChild({ childKey: data?.key })} />
            </div>

            {extendLogic && (
                <>
                    {/* Syntax */}
                    <FieldWrapper label='Syntax'>
                        <Select placeholder="Select syntax" options={syntaxOptions} value={syntax} onChange={onChangeSyntax} />
                    </FieldWrapper>

                    {data?.children?.length === 0 && (
                        <div className="value-wrapper">
                            <FieldWrapper label="Value 1"><input placeholder="Add Value" value={var1} onChange={onChangeVar1} /></FieldWrapper>
                            <FieldWrapper label="Value 2"><input placeholder="Add Value" value={var2} onChange={onChangeVar2} /></FieldWrapper>
                        </div>
                    )}

                    <div className="add-new-logic-button" onClick={() => onAddChild({ parentKey: data?.key })}>+ Add Sub Logic</div>

                    {data?.children?.map((childLogic) => (
                        <LogicSubComponent
                            key={childLogic?.key}
                            data={childLogic}
                            onAddChild={onAddChild}
                            onDeleteChild={onDeleteChild}
                            updateTreeValue={updateTreeValue}
                        />
                    ))}
                </>
            )}
        </div>
    )
}

const LogicMainComponent = ({ onCancelLogic, logicData, onDeleteChild, onAddChild, updateTreeValue }) => {
    const [syntax, setSyntax] = useState(null)
    const [var1, setVar1] = useState("")
    const [var2, setVar2] = useState("")
    const [elementScoreName, setElementScoreName] = useState(null)
    const [externalComment, setExternalComment] = useState("")
    const [extendLogic, setExtendLogic] = useState(false)

    const onChangeSyntax = (value) => {
        setSyntax(value)
        updateTreeValue(logicData.key, { syntax: value });
    }

    const onChangeVar1 = (e) => {
        const newValue = e?.target?.value;
        setVar1(newValue);
        updateTreeValue(logicData.key, { var1: newValue });
    }

    const onChangeVar2 = (e) => {
        const newValue = e?.target?.value;
        setVar2(newValue);
        updateTreeValue(logicData.key, { var2: newValue });
    }

    const onChangeElementScore = (value) => {
        setElementScoreName(value)
        updateTreeValue(logicData.key, { elementScoreName: value });
    }

    const onChangeComment = (e) => {
        const newValue = e?.target?.value;
        setExternalComment(newValue)
        updateTreeValue(logicData.key, { externalComment: newValue });
    }

    const onExtend = () => {
        setExtendLogic(!extendLogic)
    }

    return (
        <div className="logic-component-container">
            <div className="logic-title-wrapper" onClick={onExtend}>
                <div className="title-main">
                    <h3>{logicData?.title}</h3>
                    <div className="row" />
                    <div className="icons-wrapper" >{!extendLogic ? <FaChevronDown /> : <FaChevronUp />}</div>
                </div>
                <FaTrash className="delete-icon" onClick={() => onCancelLogic({ id: logicData?.key })} />
            </div>
            {extendLogic && (
                <>
                    <FieldWrapper label='Syntax'>
                        <Select placeholder="Select syntax" options={syntaxOptions} value={syntax} onChange={onChangeSyntax} />
                    </FieldWrapper>

                    {logicData?.children?.length === 0 && (
                        <div className="value-wrapper">
                            <FieldWrapper label="Value 1"><input placeholder="Enter Value 1" value={var1} onChange={onChangeVar1} /></FieldWrapper>
                            <FieldWrapper label="Value 2"><input placeholder="Enter Value 2" value={var2} onChange={onChangeVar2} /></FieldWrapper>
                        </div>
                    )}

                    <div className="sub-component-wrapper">
                        {logicData?.children?.map((childLogic) => (
                            <LogicSubComponent
                                key={childLogic?.key}
                                data={childLogic}
                                onAddChild={onAddChild}
                                onDeleteChild={onDeleteChild}
                                updateTreeValue={updateTreeValue}
                            />
                        ))}
                    </div>

                    <div className="add-new-logic-button" onClick={() => onAddChild({ parentKey: logicData?.key })}>+ Add Sub Logic</div>

                    <div className="external-wrapper">
                        <FieldWrapper label='Element Score'>
                            <Select placeholder="Select Score" options={elementScoreOptions} value={elementScoreName} onChange={onChangeElementScore} />
                        </FieldWrapper>
                        <FieldWrapper label="External Comments"><textarea placeholder="Enter comments" value={externalComment} onChange={onChangeComment} /></FieldWrapper>
                    </div>
                </>
            )}

        </div>
    )
}

const LogicSyntax = () => {
    const [logicTree, setLogicTree] = useState([])
    const [outputLogicTree, setOutputLogicTree] = useState([])

    const onAddLogic = () => {
        const lastItemId = logicTree.length > 0 ? logicTree[logicTree.length - 1].key : 0;

        const newData = {
            key: (lastItemId || 0) + 1,
            title: `Logic ${(lastItemId || 0) + 1}`,
            children: []
        }

        setLogicTree((prev) => ([...prev, newData]))
    }

    const onCancelLogic = ({ id }) => {
        const filteredLogic = logicTree?.filter((logic) => logic?.key !== id)

        setLogicTree(filteredLogic)
    }

    const addChildRecursive = (tree, parentKey) => {
        return tree.map(node => {
            if (node.key === parentKey) {

                const childCount = node.children.length + 1;
                const newKey = `${parentKey}.${childCount}`;

                return {
                    ...node,
                    children: [...node.children, { key: newKey, title: `L: ${newKey}`, children: [] }]
                };
            }

            if (node.children.length > 0) {
                return { ...node, children: addChildRecursive(node.children, parentKey) };
            }

            return node;
        });
    };

    const removeChildRecursive = (tree, childKey) => {
        return tree
            .map(node => ({
                ...node,
                children: removeChildRecursive(node.children, childKey)
            }))
            .filter(node => node.key !== childKey);
    };

    const updateTreeValue = (tree, key, updatedData) => {
        return tree.map(node => {
            if (node.key === key) {
                return { ...node, ...updatedData }; // Update the node with new data
            }

            if (node.children.length > 0) {
                return { ...node, children: updateTreeValue(node.children, key, updatedData) };
            }

            return node;
        });
    };

    const transformLogicTree = (tree) => {
        const results = [];

        function traverse(node) {
            if (!node) return null;

            // Base case: If it's a leaf node (no children), return formatted condition
            if (node?.children?.length === 0 && node?.syntax) {
                return {
                    [node?.syntax?.value]: [node?.var1, node?.var2]
                };
            }

            // Recursive case: Process children and group them under the parent syntax
            const logicSyntax = {};
            logicSyntax[node?.syntax?.value] = node.children.map(traverse).filter(Boolean);

            return logicSyntax;
        }

        // Convert main logic nodes (only the top-level has elementScoreName & externalComment)
        tree.forEach(node => {
            const logicSyntax = traverse(node);

            results.push({
                logicSyntax,
                elementScoreName: node?.elementScoreName,
                externalComment: node?.externalComment
            });
        });

        return results;
    };

    const onAddChild = ({ parentKey }) => {
        setLogicTree((prev) => addChildRecursive(prev, parentKey));
    };

    const onRemoveChild = ({ childKey }) => {
        setLogicTree((prev) => removeChildRecursive(prev, childKey));
    };

    const onUpdateValue = (key, updatedData) => {
        setLogicTree(prev => updateTreeValue(prev, key, updatedData))
    }

    useEffect(() => {
        if (logicTree) {
            const formattedOutput = transformLogicTree(logicTree)
            setOutputLogicTree(formattedOutput || [])
        }
    }, [logicTree])

    return (
        <div className="page-container">

            <div className="logic-module">
                <h1>Logic Syntax</h1>
                {logicTree?.map((logic) => (
                    <LogicMainComponent
                        key={logic?.key}
                        logicData={logic}
                        onCancelLogic={onCancelLogic}
                        onAddChild={onAddChild}
                        onDeleteChild={onRemoveChild}
                        updateTreeValue={onUpdateValue}
                    />
                ))}
                <div className="add-new-logic-button" onClick={onAddLogic}>+ Add New Logic</div>
            </div>
            <div className="output-module">
                <pre className="output-module-container">{JSON.stringify(outputLogicTree, null, 2)}</pre>
            </div>



        </div>
    )
}

export default LogicSyntax