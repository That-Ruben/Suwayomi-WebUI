/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MouseEvent, ReactNode } from 'react';
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

    return (
        <>
            <CustomTooltip title={tooltip}>
                <Button
                    onClick={handleOpen}
                    sx={{ justifyContent: 'start', textTransform: 'unset', flexGrow: 1 }}
                    variant="contained"
                    startIcon={isDefault ? defaultIcon : valueToDisplayData[value].icon}
                    endIcon={<ArrowDropDownIcon />}
                    size="large"
                >
                    {isDefault ? (
                        defaultValue === undefined ? (
                            t`Default`
                        ) : (
                            <Superscript
                                superscript={`(${t`Default`})`}
                                text={
                                    typeof valueToDisplayData[defaultValue].title === 'string'
                                        ? valueToDisplayData[defaultValue].title
                                        : t(valueToDisplayData[defaultValue].title)
                                }
                            />
                        )
                    ) : typeof valueToDisplayData[value].title === 'string' ? (
                        valueToDisplayData[value].title
                    ) : (
                        t(valueToDisplayData[value].title)
                    )}
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
