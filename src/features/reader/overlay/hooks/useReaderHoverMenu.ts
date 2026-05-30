/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { getReaderOverlayStore, useReaderSettingsStore } from '@/features/reader/stores/ReaderStore.ts';

/**
 * Class applied to the desktop nav bar drawer paper so the hover logic can recognize when the
 * cursor is over the menu.
 */
export const READER_NAV_BAR_DESKTOP_CLASS = 'reader-navbar-desktop';

/**
 * Width of the edge region (in px) that opens the menu on hover, expressed as a ratio of the reader
 * width and clamped to a sensible pixel range so it stays usable across resolutions without getting
 * wide enough to trigger by accident.
 */
const EDGE_WIDTH_RATIO = 0.04;
const EDGE_WIDTH_MIN = 32;
const EDGE_WIDTH_MAX = 80;

const getEdgeWidth = (): number =>
    Math.min(EDGE_WIDTH_MAX, Math.max(EDGE_WIDTH_MIN, window.innerWidth * EDGE_WIDTH_RATIO));

/**
 * Opens the desktop reader menu (nav bar) when the cursor hovers the left edge of the reader and
 * closes it again once the cursor leaves the menu.
 *
 * Only menus opened via hover are auto-closed - menus opened in any other way (click/double click,
 * static nav) stay open. The menu is also kept open while a popover spawned from it (e.g. one of the
 * quick setting dropdowns) is open, since those render in a portal outside the menu and would
 * otherwise count as the cursor having left it.
 *
 * Desktop/mouse only - on touch devices no pointer move events with a hovering cursor are produced.
 */
export const useReaderHoverMenu = (enabled: boolean): void => {
    const shouldOpenMenuOnHover = useReaderSettingsStore('shouldOpenMenuOnHover');
    const isStaticNav = useReaderSettingsStore('isStaticNav');

    const isActive = enabled && shouldOpenMenuOnHover && !isStaticNav;

    useEffect(() => {
        if (!isActive) {
            return undefined;
        }

        const handlePointerMove = (e: PointerEvent) => {
            const { isVisible, isVisibleViaHover, setIsVisible } = getReaderOverlayStore();
            const isWithinEdge = e.clientX <= getEdgeWidth();

            if (!isVisible) {
                if (isWithinEdge) {
                    setIsVisible(true, true);
                }
                return;
            }

            // a menu that was opened via click stays open regardless of the cursor position
            if (!isVisibleViaHover) {
                return;
            }

            // judge "over the menu" by the nav bar drawer's layout width (offsetWidth ignores the
            // slide-in transform) rather than hit-testing e.target. otherwise a fast cursor that
            // overshoots into the area the drawer is still animating into would hit the page behind it
            // and wrongly trigger a close.
            const navBar = document.querySelector(`.${READER_NAV_BAR_DESKTOP_CLASS}`);
            const navBarWidth = navBar instanceof HTMLElement ? navBar.offsetWidth : 0;

            // the drawer has not been measured yet (still mounting/animating in) - don't close
            if (navBarWidth === 0) {
                return;
            }

            // tooltips/poppers render in a portal outside the nav bar (MUI tooltips are interactive by
            // default), so the cursor being over one of them also counts as being over the menu
            const target = e.target instanceof Element ? e.target : null;
            const isOverMenu = e.clientX <= navBarWidth;
            const isOverTooltip = !!target?.closest('.MuiTooltip-popper, .MuiPopper-root');
            const isPopoverOpen = !!document.querySelector('.MuiModal-root');

            if (!isOverMenu && !isOverTooltip && !isWithinEdge && !isPopoverOpen) {
                setIsVisible(false);
            }
        };

        // close a hover opened menu when the cursor leaves the window entirely (e.g. exiting past the
        // left edge), so it does not stay open while the cursor is somewhere else on the desktop.
        // this is viewport-exit, not focus loss, so alt-tabbing with the cursor still over the reader
        // keeps the menu open.
        const handlePointerLeaveWindow = () => {
            const { isVisible, isVisibleViaHover, setIsVisible } = getReaderOverlayStore();
            const isPopoverOpen = !!document.querySelector('.MuiModal-root');

            if (isVisible && isVisibleViaHover && !isPopoverOpen) {
                setIsVisible(false);
            }
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', handlePointerLeaveWindow);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            document.documentElement.removeEventListener('mouseleave', handlePointerLeaveWindow);
        };
    }, [isActive]);
};
