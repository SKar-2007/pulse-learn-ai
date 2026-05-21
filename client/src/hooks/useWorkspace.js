import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { apiUrl, authHeaders } from '../lib/apiClient';

const DEMO_LAYOUT = [
  { i: 'block-1', x: 0, y: 0, w: 4, h: 4, type: 'quiz', config: {} },
  { i: 'block-2', x: 4, y: 0, w: 4, h: 4, type: 'progress', config: {} },
  { i: 'block-3', x: 8, y: 0, w: 4, h: 4, type: 'notes', config: { text: 'Use demo mode to explore workspace blocks and notes.' } },
];

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function useWorkspace(roadmapId, session, isShared = false) {
    const [layout, setLayout] = useState([]);
    const [pages, setPages] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    const [currentPage, setCurrentPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const demo = DEMO_MODE || session?.access_token === 'demo';

    const getHeaders = useCallback(() => ({ Authorization: `Bearer ${session?.access_token}` }), [session]);

    const loadPages = useCallback(async () => {
        if (!roadmapId || demo) return;
        try {
            const { data } = await axios.get(
                apiUrl(`/api/workspace/${roadmapId}/pages`),
                { headers: getHeaders() }
            );
            const loadedPages = data.pages || [];
            setPages(loadedPages);

            if (!currentPageId && loadedPages.length) {
                setCurrentPageId(loadedPages[0].id);
                setCurrentPage(loadedPages[0]);
            } else if (currentPageId) {
                setCurrentPage(loadedPages.find((page) => page.id === currentPageId) || null);
            }
        } catch (err) {
            console.error('Failed to load workspace pages:', err);
        }
    }, [roadmapId, currentPageId, demo, getHeaders]);

    const createPage = async (title, parentPageId = null) => {
        if (!roadmapId || demo) return null;
        try {
            const { data } = await axios.post(
                apiUrl(`/api/workspace/${roadmapId}/pages`),
                { title, parent_page_id: parentPageId },
                { headers: getHeaders() }
            );
            setPages((prev) => [...prev, data.page]);
            setCurrentPageId(data.page.id);
            setCurrentPage(data.page);
            setLayout([]);
            return data.page;
        } catch (err) {
            console.error('Failed to create page:', err);
            return null;
        }
    };

    const duplicatePage = async (pageId, title) => {
        if (!roadmapId || demo || !pageId) return null;
        try {
            const { data } = await axios.post(
                apiUrl(`/api/workspace/${roadmapId}/pages/${pageId}/duplicate`),
                { title },
                { headers: getHeaders() }
            );
            setPages((prev) => [...prev, data.page]);
            return data.page;
        } catch (err) {
            console.error('Failed to duplicate page:', err);
            return null;
        }
    };

    const renamePage = async (pageId, title) => {
        if (!roadmapId || demo || !pageId) return null;
        try {
            const { data } = await axios.patch(
                apiUrl(`/api/workspace/${roadmapId}/pages/${pageId}`),
                { title },
                { headers: getHeaders() }
            );

            setPages((prev) => prev.map((page) => (page.id === pageId ? data.page : page)));
            if (currentPageId === pageId) {
                setCurrentPage(data.page);
            }
            return data.page;
        } catch (err) {
            console.error('Failed to rename page:', err);
            return null;
        }
    };

    const deletePage = async (pageId) => {
        if (!roadmapId || demo || !pageId) return false;
        try {
            await axios.delete(
                apiUrl(`/api/workspace/${roadmapId}/pages/${pageId}`),
                { headers: getHeaders() }
            );
            setPages((prev) => prev.filter((page) => page.id !== pageId));
            if (currentPageId === pageId) {
                const fallback = pages.find((page) => page.id !== pageId) || null;
                setCurrentPageId(fallback?.id || null);
                setCurrentPage(fallback);
            }
            return true;
        } catch (err) {
            console.error('Failed to delete page:', err);
            return false;
        }
    };

    const selectPage = (pageId) => {
        setCurrentPageId(pageId);
        setCurrentPage(pages.find((page) => page.id === pageId) || null);
    };

    const loadLayout = useCallback(async () => {
        if (!roadmapId) return;
        setLoading(true);
        try {
            if (demo) {
                setLayout(DEMO_LAYOUT);
                return;
            }

            const pageQuery = currentPageId ? `&page_id=${currentPageId}` : '';
            const { data } = await axios.get(
                apiUrl(`/api/workspace/${roadmapId}?is_shared=${isShared}${pageQuery}`),
                { headers: getHeaders() }
            );
            setLayout(data.layout || []);
        } catch (err) {
            console.error('Failed to load workspace:', err);
        } finally {
            setLoading(false);
        }
    }, [roadmapId, demo, isShared, currentPageId, getHeaders]);

    const saveLayout = async (newLayout) => {
        if (!roadmapId && !demo) return;
        if (demo) {
            setLayout(newLayout);
            return;
        }

        try {
            await axios.post(
                apiUrl('/api/workspace/layout'),
                { roadmap_id: roadmapId, layout_json: newLayout, is_shared: isShared, page_id: currentPageId },
                { headers: getHeaders() }
            );
        } catch (err) {
            console.error('Failed to save workspace:', err);
        }
    };

    useEffect(() => {
        if (roadmapId && !demo) {
            loadPages();
        }
    }, [roadmapId, demo, loadPages]);

    useEffect(() => {
        if (demo) {
            setLayout(DEMO_LAYOUT);
            return;
        }

        loadLayout();
    }, [currentPageId, demo, loadLayout]);

    useEffect(() => {
        const demoMode = DEMO_MODE || session?.access_token === 'demo';
        if (!roadmapId || !isShared || demoMode) return;
        const channel = supabase
            .channel(`workspace-${roadmapId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'workspace_layouts',
                filter: `roadmap_id=eq.${roadmapId}`
            }, (payload) => {
                if (payload.new.is_shared) {
                    setLayout(payload.new.layout_json);
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [roadmapId, session, isShared]);

    return {
        layout,
        setLayout,
        saveLayout,
        pages,
        currentPageId,
        currentPage,
        selectPage,
        createPage,
        duplicatePage,
        renamePage,
        deletePage,
        loading,
    };
}
