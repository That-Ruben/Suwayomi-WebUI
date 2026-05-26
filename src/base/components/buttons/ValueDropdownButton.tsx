/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MouseEvent, ReactNode, WheelEvent } from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import type { MultiValueButtonProps } from '@/base/Base.types.ts';
import { Superscript } from '@/base/components/texts/Superscript.tsx';

export const ValueDropdownButton = <Value extends string | number>({
    tooltip,
    value,
    defaultValue,
    values,
    setValue,
    valueToDisplayData,
    isDefaultable,
    onDefault,
    defaultIcon,
}: MultiValueButtonProps<Value> & { defaultIcon?: ReactNode }) => {
    const { t } = useLingui();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isDefault = value === undefined;
    const open = Boolean(anchorEl);

    const handleOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (selectedValue: Value) => {
        setValue(selectedValue);
        handleClose();
    };

    const handleDefault = () => {
        onDefault?.();
        handleClose();
    };

    const handleWheel = (event: WheelEvent<HTMLElement>) => {
        event.preventDefault();
        const currentIndex = isDefault ? -1 : values.indexOf(value);
        if (event.deltaY < 0) {
            // scroll up → previous
            if (currentIndex > 0) {setValue(values[currentIndex - 1]);}
            else if (currentIndex === 0 && isDefaultable) {onDefault?.();}
        } else if (currentIndex === -1) {
            // scroll down from default → first value
            setValue(values[0]);
        } else if (currentIndex < values.length - 1) {
            // scroll down → next
            setValue(values[currentIndex + 1]);
        }
    };

    let buttonLabel: ReactNode;
    if (isDefault) {
        if (defaultValue === undefined) {
            buttonLabel = t`Default`;
        } else {
            const defaultTitle =
                typeof valueToDisplayData[defaultValue].title === 'string'
                    ? valueToDisplayData[defaultValue].title
                    : t(valueToDisplayData[defaultValue].title);
            buttonLabel = <Superscript superscript={`(${t`Default`})`} text={defaultTitle} />;
        }
    } else {
        buttonLabel =
            typeof valueToDisplayData[value].title === 'string'
                ? valueToDisplayData[value].title
                : t(valueToDisplayData[value].title);
    }

    return (
        <>
            <CustomTooltip title={tooltip}>
                <Button
                    onClick={handleOpen}
                    onWheel={handleWheel}
                    sx={{ justifyContent: 'start', textTransform: 'unset', flexGrow: 1 }}
                    variant="contained"
                    startIcon={isDefault ? defaultIcon : valueToDisplayData[value].icon}
                    endIcon={<ArrowDropDownIcon />}
                    size="large"
                >
                    {buttonLabel}
                </Button>
            </CustomTooltip>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {isDefaultable && (
                    <MenuItem onClick={handleDefault} selected={isDefault}>
                        <ListItemIcon>{defaultIcon}</ListItemIcon>
                        <ListItemText>{t`Default`}</ListItemText>
                    </MenuItem>
                )}
                {values.map((v) => (
                    <MenuItem key={v} onClick={() => handleSelect(v)} selected={!isDefault && value === v}>
                        <ListItemIcon>{valueToDisplayData[v].icon}</ListItemIcon>
                        <ListItemText>
                            {typeof valueToDisplayData[v].title === 'string'
                                ? valueToDisplayData[v].title
                                : t(valueToDisplayData[v].title)}
                        </ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
