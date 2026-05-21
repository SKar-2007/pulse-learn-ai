import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FileText, Bold, Italic, List, Sparkles } from 'lucide-react';
import axios from 'axios';
import {API_BASE} from '../../../lib/apiClient';

export default function NotesBlock({ roadmap, session, config, onConfigChange, workspaceNotes }) {
    const [commandLoading, setCommandLoading] = useState(false);

    const runSlashAICommand = async (editor, query, from, to) => {
        if (!session?.access_token) return;
        setCommandLoading(true);
        try {
            const prompt = query
                ? `Rewrite the note below using this instruction: ${query}\n\n`
                : 'Summarize the note below into concise study guidance and next steps. Use bullet points where possible.\n\n';

            const { data } = await axios.post(
                `${API_BASE}/api/user/chat`,
                {
                    message: `${prompt}${editor.getText()}`,
                    history: [],
                    workspaceNotes: workspaceNotes || '',
                },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );

            editor.chain().focus().deleteRange({ from, to }).insertContent(`<p>${data.reply}</p>`).run();
        } catch (err) {
            console.error('AI slash command failed:', err);
        } finally {
            setCommandLoading(false);
        }
    };

    const editor = useEditor({
        extensions: [StarterKit],
        content: config?.content || '<p>Start taking notes here...</p>',
        onUpdate: ({ editor }) => {
            onConfigChange({ content: editor.getHTML(), text: editor.getText() });
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert focus:outline-none max-w-none text-white h-full overflow-y-auto px-4 py-2',
            },
            handleDOMEvents: {
                keydown: async (view, event) => {
                    if (event.key !== 'Enter') return false;
                    const { state } = view;
                    const { $from } = state.selection;
                    const lineStart = $from.start();
                    const lineText = state.doc.textBetween(lineStart, $from.pos, '\n', '\n');
                    const match = lineText.match(/(^|\s)\/ai(?:\s+(.*))?$/i);

                    if (!match) return false;
                    event.preventDefault();
                    const commandText = match[0].trim();
                    const from = lineStart + lineText.lastIndexOf(commandText);
                    const to = $from.pos;
                    await runSlashAICommand(editor, match[2]?.trim() || '', from, to);
                    return true;
                },
            },
        },
    });

    if (!editor) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 drag-handle cursor-grab active:cursor-grabbing">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <FileText className="text-white/60" size={16} />
                        <h3 className="font-bold text-white text-xs uppercase tracking-widest">Study Notes</h3>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1 rounded ${editor.isActive('bold') ? 'bg-white/10' : 'bg-black/90 hover:bg-black/85'}`}
                        >
                            <Bold size={12} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1 rounded ${editor.isActive('italic') ? 'bg-white/10' : 'bg-black/90 hover:bg-black/85'}`}
                        >
                            <Italic size={12} />
                        </button>
                        <div className="w-px h-4 bg-black/90 mx-1" />
                        <button
                            onClick={async () => {
                                const text = editor.getText();
                                const { data } = await axios.post(
                                    `${API_BASE}/api/user/chat`,
                                    {
                                        message: `Summarize this text in a few bullet points:\n\n${text}`,
                                        history: [],
                                        workspaceNotes: workspaceNotes || '',
                                    },
                                    { headers: { Authorization: `Bearer ${session.access_token}` } }
                                );
                                editor.chain().focus().insertContent(`<p><strong>AI Summary:</strong></p><p>${data.reply}</p>`).run();
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/10/20 border border-white/10/30 rounded text-[8px] font-black uppercase text-white/60 transition-all"
                        >
                            <Sparkles size={10} /> Summarize
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-white/40">
                    <span>Type <span className="font-semibold text-white">/ai</span> then press Enter to generate AI study guidance.</span>
                    {commandLoading && <span className="text-white/60">Running AI command...</span>}
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
}