'use client';

import { useEffect, useCallback } from 'react';

/**
 * Custom hook to dynamically align card elements within each row of a grid.
 * It measures the height of specified elements and sets a consistent min-height
 * per row, ensuring alignment while maximizing space efficiency.
 * 
 * @param {string} gridSelector - CSS selector for the grid container
 * @param {string[]} elementSelectors - Array of CSS selectors for elements to align
 * @param {number} columnsDesktop - Number of columns on desktop (lg breakpoint)
 */
export function useCardAlignment(gridSelector, elementSelectors, columnsDesktop = 3) {
    const alignElements = useCallback(() => {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;

        // Determine current column count based on viewport
        const gridStyle = window.getComputedStyle(grid);
        const gridTemplateColumns = gridStyle.getPropertyValue('grid-template-columns');
        const columnCount = gridTemplateColumns.split(' ').filter(Boolean).length || 1;

        // Process each selector
        for (const selector of elementSelectors) {
            const elements = grid.querySelectorAll(selector);
            if (elements.length === 0) continue;

            // Reset heights first to get natural measurements
            elements.forEach(el => {
                el.style.minHeight = '';
            });

            // Force reflow to get accurate measurements
            void grid.offsetHeight;

            // Group elements by row
            const rows = [];
            elements.forEach((el, index) => {
                const rowIndex = Math.floor(index / columnCount);
                if (!rows[rowIndex]) rows[rowIndex] = [];
                rows[rowIndex].push(el);
            });

            // Set min-height per row based on tallest element
            rows.forEach(rowElements => {
                const maxHeight = Math.max(...rowElements.map(el => el.scrollHeight));
                rowElements.forEach(el => {
                    el.style.minHeight = `${maxHeight}px`;
                });
            });
        }
    }, [gridSelector, elementSelectors]);

    useEffect(() => {
        // Run alignment on mount and after a short delay (for fonts/images)
        alignElements();
        const timeoutId = setTimeout(alignElements, 100);

        // Re-run on resize
        const handleResize = () => {
            alignElements();
        };

        window.addEventListener('resize', handleResize);

        // Observe DOM changes (for filter updates)
        const observer = new MutationObserver(() => {
            // Debounce the alignment call
            setTimeout(alignElements, 50);
        });

        const grid = document.querySelector(gridSelector);
        if (grid) {
            observer.observe(grid, { childList: true, subtree: false });
        }

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, [gridSelector, alignElements]);

    return alignElements;
}
