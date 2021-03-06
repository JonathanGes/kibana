/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiContextMenu,
  EuiButton,
  EuiFilterGroup,
  EuiFilterButton,
  EuiContextMenuPanelDescriptor,
} from '@elastic/eui';
import React, { useEffect, useState, useCallback, useMemo } from 'react';

import * as i18n from '../translations';
import { ExceptionListType, Filter } from '../types';

interface ExceptionsViewerHeaderProps {
  isInitLoading: boolean;
  supportedListTypes: ExceptionListType[];
  detectionsListItems: number;
  endpointListItems: number;
  onFilterChange: (arg: Filter) => void;
  onAddExceptionClick: (type: ExceptionListType) => void;
}

/**
 * Collection of filters and toggles for filtering exception items.
 */
const ExceptionsViewerHeaderComponent = ({
  isInitLoading,
  supportedListTypes,
  detectionsListItems,
  endpointListItems,
  onFilterChange,
  onAddExceptionClick,
}: ExceptionsViewerHeaderProps): JSX.Element => {
  const [filter, setFilter] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [showDetectionsList, setShowDetectionsList] = useState(false);
  const [showEndpointList, setShowEndpointList] = useState(false);
  const [isAddExceptionMenuOpen, setAddExceptionMenuOpen] = useState(false);

  useEffect((): void => {
    onFilterChange({
      filter: { filter, showDetectionsList, showEndpointList, tags },
      pagination: {},
    });
  }, [filter, tags, showDetectionsList, showEndpointList, onFilterChange]);

  const onAddExceptionDropdownClick = useCallback(
    (): void => setAddExceptionMenuOpen(!isAddExceptionMenuOpen),
    [setAddExceptionMenuOpen, isAddExceptionMenuOpen]
  );

  const handleDetectionsListClick = useCallback((): void => {
    setShowDetectionsList(!showDetectionsList);
    setShowEndpointList(false);
  }, [showDetectionsList, setShowDetectionsList, setShowEndpointList]);

  const handleEndpointListClick = useCallback((): void => {
    setShowEndpointList(!showEndpointList);
    setShowDetectionsList(false);
  }, [showEndpointList, setShowEndpointList, setShowDetectionsList]);

  const handleOnSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const searchValue = event.target.value;
      const tagsRegex = /(tags:[^\s]*)/i;
      const tagsMatch = searchValue.match(tagsRegex);
      const foundTags: string = tagsMatch != null ? tagsMatch[0].split(':')[1] : '';
      const filterString = tagsMatch != null ? searchValue.replace(tagsRegex, '') : searchValue;

      if (foundTags.length > 0) {
        setTags(foundTags.split(','));
      }

      setFilter(filterString.trim());
    },
    [setTags, setFilter]
  );

  const onAddException = useCallback(
    (type: ExceptionListType): void => {
      onAddExceptionClick(type);
      setAddExceptionMenuOpen(false);
    },
    [onAddExceptionClick, setAddExceptionMenuOpen]
  );

  const addExceptionButtonOptions = useMemo(
    (): EuiContextMenuPanelDescriptor[] => [
      {
        id: 0,
        items: [
          {
            name: i18n.ADD_TO_ENDPOINT_LIST,
            onClick: () => onAddException(ExceptionListType.ENDPOINT),
            'data-test-subj': 'addEndpointExceptionBtn',
          },
          {
            name: i18n.ADD_TO_DETECTIONS_LIST,
            onClick: () => onAddException(ExceptionListType.DETECTION_ENGINE),
            'data-test-subj': 'addDetectionsExceptionBtn',
          },
        ],
      },
    ],
    [onAddException]
  );

  return (
    <EuiFlexGroup alignItems="center">
      <EuiFlexItem grow={true}>
        <EuiFieldSearch
          data-test-subj="exceptionsHeaderSearch"
          aria-label={i18n.SEARCH_DEFAULT}
          placeholder={i18n.SEARCH_DEFAULT}
          onChange={handleOnSearch}
          disabled={isInitLoading}
          incremental={false}
          fullWidth
        />
      </EuiFlexItem>

      {supportedListTypes.length < 2 && (
        <EuiFlexItem grow={false}>
          <EuiButton
            data-test-subj="exceptionsHeaderAddExceptionBtn"
            onClick={() => onAddException(supportedListTypes[0])}
            isDisabled={isInitLoading}
            fill
          >
            {i18n.ADD_EXCEPTION_LABEL}
          </EuiButton>
        </EuiFlexItem>
      )}

      {supportedListTypes.length > 1 && (
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiFilterGroup data-test-subj="exceptionsFilterGroupBtns">
                <EuiFilterButton
                  data-test-subj="exceptionsDetectionFilterBtn"
                  hasActiveFilters={showDetectionsList}
                  onClick={handleDetectionsListClick}
                  isDisabled={isInitLoading}
                >
                  {i18n.DETECTION_LIST}
                  {detectionsListItems != null ? ` (${detectionsListItems})` : ''}
                </EuiFilterButton>
                <EuiFilterButton
                  data-test-subj="exceptionsEndpointFilterBtn"
                  hasActiveFilters={showEndpointList}
                  onClick={handleEndpointListClick}
                  isDisabled={isInitLoading}
                >
                  {i18n.ENDPOINT_LIST}
                  {endpointListItems != null ? ` (${endpointListItems})` : ''}
                </EuiFilterButton>
              </EuiFilterGroup>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiPopover
                button={
                  <EuiButton
                    data-test-subj="exceptionsHeaderAddExceptionPopoverBtn"
                    onClick={onAddExceptionDropdownClick}
                    isDisabled={isInitLoading}
                    iconType="arrowDown"
                    iconSide="right"
                    fill
                  >
                    {i18n.ADD_EXCEPTION_LABEL}
                  </EuiButton>
                }
                isOpen={isAddExceptionMenuOpen}
                closePopover={onAddExceptionDropdownClick}
                anchorPosition="downCenter"
                panelPaddingSize="none"
                repositionOnScroll
              >
                <EuiContextMenu initialPanelId={0} panels={addExceptionButtonOptions} />
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

ExceptionsViewerHeaderComponent.displayName = 'ExceptionsViewerHeaderComponent';

export const ExceptionsViewerHeader = React.memo(ExceptionsViewerHeaderComponent);

ExceptionsViewerHeader.displayName = 'ExceptionsViewerHeader';
