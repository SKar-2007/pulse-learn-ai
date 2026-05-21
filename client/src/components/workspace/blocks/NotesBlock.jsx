import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FileText, Bold, Italic, List, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function NotesBlock({ roadmap, session, config, onConfigChange }) {
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
        },
    });

    if (!editor) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800 drag-handle cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                    <FileText className="text-indigo-400" size={16} />
                    <h3 className="font-bold text-white text-xs uppercase tracking-widest">Study Notes</h3>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        <Bold size={12} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        <Italic size={12} />
                    </button>
                    <div className="w-px h-4 bg-gray-800 mx-1" />
                    <button
                        onClick={async () => {
                            const text = editor.getText();
                            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/chat`, {
                                message: `Summarize this text in a few bullet points:\n\n${text}`,
                                history: [],
                                workspaceNotes: ""
                            }, { headers: { Authorization: `Bearer ${session.access_token}` } });
                            editor.chain().focus().insertContent(`<p><strong>AI Summary:</strong></p><p>${data.reply}</p>`).run();
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded text-[8px] font-black uppercase text-indigo-400 transition-all"
                    >
                        <Sparkles size={10} /> Summarize
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
}
