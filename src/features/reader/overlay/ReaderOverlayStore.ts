/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SliceCreator } from '@/lib/zustand/Zustand.types.ts';

export interface ReaderOverlayStoreSlice {
    overlay: {
        isVisible: boolean;
        /**
         * Whether the currently visible overlay was opened by hovering the edge of the reader.
         *
         * Hover opened overlays automatically close once the cursor leaves them, while overlays
         * opened in any other way (e.g. via click) stay open until explicitly closed.
         */
        isVisibleViaHover: boolean;
        setIsVisible: (visible: boolean, viaHover?: boolean) => void;
        reset: () => ReaderOverlayStoreSlice;
    };
}

const DEFAULT_STATE = {
    isVisible: false,
    isVisibleViaHover: false,
} satisfies Pick<ReaderOverlayStoreSlice['overlay'], 'isVisible' | 'isVisibleViaHover'>;

export const createReaderOverlayStoreSlice = <T extends ReaderOverlayStoreSlice>(
    ...[createActionName, set, get]: Parameters<SliceCreator<T>>
): ReaderOverlayStoreSlice => ({
    overlay: {
        isVisible: DEFAULT_STATE.isVisible,
        isVisibleViaHover: DEFAULT_STATE.isVisibleViaHover,
        setIsVisible: (visible, viaHover = false) =>
            set(
                (draft) => {
                    draft.overlay.isVisible = visible;
                    draft.overlay.isVisibleViaHover = visible && viaHover;
                },
                undefined,
                createActionName('setIsVisible'),
            ),
        reset: () => ({ overlay: { ...get().overlay, ...DEFAULT_STATE } }),
    },
});
