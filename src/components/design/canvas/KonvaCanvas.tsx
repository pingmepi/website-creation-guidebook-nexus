import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

interface KonvaCanvasProps {
    width: number;
    height: number;
    backgroundColor?: string;
    initialImage?: string;
    onDesignChange?: (dataURL: string) => void;
    isDrawingMode: boolean;
    brushSize: number;
    brushColor?: string;
}

export interface KonvaCanvasHandle {
    addText: (text: string, color: string) => void;
    addRect: (color: string) => void;
    addCircle: (color: string) => void;
    deleteSelected: () => void;
    clear: () => void;
    updateSelectedColor: (color: string) => void;
    exportImage: () => string;
}

interface CanvasElement {
    id: string;
    type: 'rect' | 'circle' | 'text' | 'image' | 'line';
    attrs: any;
}

const URLImage = ({ src, canvasWidth, canvasHeight, onLoaded }: { src: string, canvasWidth: number, canvasHeight: number, onLoaded: () => void }) => {
    const [image] = useImage(src, 'anonymous');
    const imageRef = useRef<Konva.Image>(null);

    useEffect(() => {
        if (image && imageRef.current) {
            // Scale image to fit
            const scale = Math.min(
                (canvasWidth - 40) / image.width,
                (canvasHeight - 40) / image.height
            );

            imageRef.current.width(image.width * scale);
            imageRef.current.height(image.height * scale);
            imageRef.current.x((canvasWidth - imageRef.current.width()) / 2);
            imageRef.current.y((canvasHeight - imageRef.current.height()) / 2);
            onLoaded();
        }
    }, [image, canvasWidth, canvasHeight, onLoaded, src]);

    if (!image) return null;

    return (
        <KonvaImage
            ref={imageRef}
            image={image}
            name="mainImage"
            draggable
        />
    );
};

export const KonvaCanvas = forwardRef<KonvaCanvasHandle, KonvaCanvasProps>(({
    width,
    height,
    backgroundColor = "#f0f0f0",
    initialImage,
    onDesignChange,
    isDrawingMode,
    brushSize,
    brushColor = "#000000"
}, ref) => {
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [lines, setLines] = useState<CanvasElement[]>([]); // Separated lines for smoother drawing
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const isDrawing = useRef(false);

    // Text editing state
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [editingTextValue, setEditingTextValue] = useState<string>("");
    const [editingTextPos, setEditingTextPos] = useState<{ x: number; y: number; fontSize: number; fill: string } | null>(null);

    // Load initial image if present
    // We handle this via a special component or effect. 
    // Simplified: We treat everything as elements.

    // Export Logic
    const exportStage = useCallback(() => {
        if (!stageRef.current) return "";

        // Hide safety area and transformer
        const safetyArea = stageRef.current.findOne('.safetyArea');
        if (safetyArea) safetyArea.hide();

        if (transformerRef.current) transformerRef.current.hide();

        const dataURL = stageRef.current.toDataURL({
            pixelRatio: 2,
            mimeType: "image/png"
        });

        // Restore visibility
        if (safetyArea) safetyArea.show();
        if (transformerRef.current) transformerRef.current.show();

        return dataURL;
    }, []);

    const handleImageLoaded = useCallback(() => {
        // FIX: Prevent recursive loop. Do not trigger design change just because background image loaded.
    }, []);

    // Handle imperative handle for parent refs
    useImperativeHandle(ref, () => ({
        addText: (text: string, color: string) => {
            const id = `text-${Date.now()}`;
            const newElement: CanvasElement = {
                id,
                type: 'text',
                attrs: {
                    x: width / 2 - 50,
                    y: height / 2 - 10,
                    text,
                    fontSize: 20,
                    fontFamily: 'Arial',
                    fill: color,
                    draggable: true,
                }
            };
            setElements(prev => [...prev, newElement]);
            setSelectedId(id);
        },
        addRect: (color: string) => {
            const id = `rect-${Date.now()}`;
            const newElement: CanvasElement = {
                id,
                type: 'rect',
                attrs: {
                    x: width / 2 - 40,
                    y: height / 2 - 30,
                    width: 80,
                    height: 60,
                    fill: color,
                    draggable: true,
                }
            };
            setElements(prev => [...prev, newElement]);
            setSelectedId(id);
        },
        addCircle: (color: string) => {
            const id = `circle-${Date.now()}`;
            const newElement: CanvasElement = {
                id,
                type: 'circle',
                attrs: {
                    x: width / 2,
                    y: height / 2,
                    radius: 40,
                    fill: color,
                    draggable: true,
                }
            };
            setElements(prev => [...prev, newElement]);
            setSelectedId(id);
        },
        deleteSelected: () => {
            if (selectedId) {
                setElements(prev => prev.filter(el => el.id !== selectedId));
                setLines(prev => prev.filter(l => l.id !== selectedId));
                setSelectedId(null);
            }
        },
        clear: () => {
            setElements([]);
            setLines([]);
            setSelectedId(null);
        },
        updateSelectedColor: (color: string) => {
            if (selectedId) {
                setElements(prev => prev.map(el => {
                    if (el.id === selectedId) {
                        return { ...el, attrs: { ...el.attrs, fill: color } };
                    }
                    return el;
                }));
            }
        },
        exportImage: () => {
            return exportStage();
        }
    }));

    // Notification debounce
    // Use ref to hold latest callback to avoid effect re-triggering
    const onDesignChangeRef = useRef(onDesignChange);
    useEffect(() => {
        onDesignChangeRef.current = onDesignChange;
    }, [onDesignChange]);

    // Notification debounce
    useEffect(() => {
        // Skip initial render or empty state if needed, but here we just want to debounce changes
        // Only trigger if elements or lines actually changed.
        // We need to be careful not to trigger on mount if we haven't changed anything.

        const timeout = setTimeout(() => {
            if (onDesignChangeRef.current) {
                const dataURL = exportStage();
                onDesignChangeRef.current(dataURL);
            }
        }, 100); // Reduced from 500ms for faster preview updates
        return () => clearTimeout(timeout);
    }, [elements, lines, exportStage]); // Removed onDesignChange from dependencies

    // Transformer logic
    useEffect(() => {
        if (selectedId && transformerRef.current && stageRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        } else {
            if (transformerRef.current) {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        }
    }, [selectedId, elements]);

    // Drawing Handlers
    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        // If clicked on empty stage, deselect
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
        }

        if (!isDrawingMode) return;

        isDrawing.current = true;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        const id = `line-${Date.now()}`;
        const newLine: CanvasElement = {
            id,
            type: 'line',
            attrs: {
                points: [pos.x, pos.y],
                stroke: brushColor,
                strokeWidth: brushSize,
                tension: 0.5,
                lineCap: 'round',
                lineJoin: 'round',
            }
        };
        setLines([...lines, newLine]);
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (!isDrawingMode || !isDrawing.current) return;

        const stage = e.target.getStage();
        const point = stage?.getPointerPosition();
        if (!point) return;

        const lastLine = lines[lines.length - 1];
        // Add point
        lastLine.attrs.points = lastLine.attrs.points.concat([point.x, point.y]);

        // Replace last line
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    // Handle double-click on text to start editing
    const handleTextDblClick = (el: CanvasElement) => {
        if (isDrawingMode) return;
        setSelectedId(null); // Deselect to hide transformer
        setEditingTextId(el.id);
        setEditingTextValue(el.attrs.text);
        setEditingTextPos({
            x: el.attrs.x,
            y: el.attrs.y,
            fontSize: el.attrs.fontSize || 20,
            fill: el.attrs.fill || '#000000'
        });
    };

    // Handle text edit completion
    const handleTextEditComplete = () => {
        if (editingTextId && editingTextValue.trim()) {
            setElements(prev => prev.map(el => {
                if (el.id === editingTextId) {
                    return { ...el, attrs: { ...el.attrs, text: editingTextValue } };
                }
                return el;
            }));
        }
        setEditingTextId(null);
        setEditingTextValue("");
        setEditingTextPos(null);
    };

    // Helper to update element after drag or transform
    const updateElementFromNode = (id: string, node: Konva.Node) => {
        setElements(prev => prev.map(el => {
            if (el.id === id) {
                return {
                    ...el,
                    attrs: {
                        ...el.attrs,
                        x: node.x(),
                        y: node.y(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                        rotation: node.rotation(),
                    }
                };
            }
            return el;
        }));
    };

    return (
        <div style={{ position: 'relative', backgroundColor, border: "1px solid #e0e0e0", borderRadius: "8px", overflow: 'hidden' }}>
            <Stage
                width={width}
                height={height}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                ref={stageRef}
            >
                <Layer ref={layerRef}>
                    {/* Safety Area */}
                    <Rect
                        name="safetyArea"
                        x={10}
                        y={10}
                        width={width - 20}
                        height={height - 20}
                        stroke="#5cb85c"
                        strokeWidth={1}
                        dash={[5, 5]}
                        listening={false}
                    />

                    {/* Initial Image */}
                    {initialImage && (
                        <URLImage
                            src={initialImage}
                            canvasWidth={width}
                            canvasHeight={height}
                            onLoaded={handleImageLoaded}
                        />
                    )}

                    {/* User Elements */}
                    {elements.map((el) => {
                        if (el.type === 'rect') return (
                            <Rect
                                key={el.id}
                                id={el.id}
                                {...el.attrs}
                                onClick={() => !isDrawingMode && setSelectedId(el.id)}
                                onTap={() => !isDrawingMode && setSelectedId(el.id)}
                                onDragEnd={(e) => updateElementFromNode(el.id, e.target)}
                                onTransformEnd={(e) => updateElementFromNode(el.id, e.target)}
                            />
                        );
                        if (el.type === 'circle') return (
                            <Circle
                                key={el.id}
                                id={el.id}
                                {...el.attrs}
                                onClick={() => !isDrawingMode && setSelectedId(el.id)}
                                onTap={() => !isDrawingMode && setSelectedId(el.id)}
                                onDragEnd={(e) => updateElementFromNode(el.id, e.target)}
                                onTransformEnd={(e) => updateElementFromNode(el.id, e.target)}
                            />
                        );
                        if (el.type === 'text') return (
                            <Text
                                key={el.id}
                                id={el.id}
                                {...el.attrs}
                                visible={editingTextId !== el.id}
                                onClick={() => !isDrawingMode && setSelectedId(el.id)}
                                onTap={() => !isDrawingMode && setSelectedId(el.id)}
                                onDblClick={() => handleTextDblClick(el)}
                                onDblTap={() => handleTextDblClick(el)}
                                onDragEnd={(e) => updateElementFromNode(el.id, e.target)}
                                onTransformEnd={(e) => updateElementFromNode(el.id, e.target)}
                            />
                        );
                        return null;
                    })}

                    {/* Drawn Lines */}
                    {lines.map((line) => (
                        <Line
                            key={line.id}
                            {...line.attrs}
                            stroke={line.attrs.stroke}
                            strokeWidth={line.attrs.strokeWidth}
                        />
                    ))}

                    {/* Placeholder Text if empty */}
                    {!initialImage && elements.length === 0 && lines.length === 0 && (
                        <Text
                            text="Upload your design"
                            x={width / 2}
                            y={height / 2}
                            offsetX={70}
                            offsetY={10}
                            fontSize={18}
                            fontFamily="Arial"
                            fill="#999999"
                            listening={false}
                        />
                    )}

                    <Transformer ref={transformerRef} />
                </Layer>
            </Stage>

            {/* HTML Input for inline text editing */}
            {editingTextId && editingTextPos && (
                <input
                    type="text"
                    value={editingTextValue}
                    onChange={(e) => setEditingTextValue(e.target.value)}
                    onBlur={handleTextEditComplete}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleTextEditComplete();
                        }
                        if (e.key === 'Escape') {
                            setEditingTextId(null);
                            setEditingTextValue("");
                            setEditingTextPos(null);
                        }
                    }}
                    autoFocus
                    style={{
                        position: 'absolute',
                        top: editingTextPos.y,
                        left: editingTextPos.x,
                        fontSize: editingTextPos.fontSize,
                        fontFamily: 'Arial',
                        color: editingTextPos.fill,
                        background: 'rgba(255,255,255,0.9)',
                        border: '1px solid #3b82f6',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        outline: 'none',
                        zIndex: 10,
                        minWidth: '100px'
                    }}
                />
            )}
        </div>
    );
});

KonvaCanvas.displayName = "KonvaCanvas";
