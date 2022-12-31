import React, {useCallback} from 'react';
import {SearchBoxProps} from '../hyper';
import {VscArrowUp} from '@react-icons/all-files/vsc/VscArrowUp';
import {VscArrowDown} from '@react-icons/all-files/vsc/VscArrowDown';
import {VscClose} from '@react-icons/all-files/vsc/VscClose';
import {VscCaseSensitive} from '@react-icons/all-files/vsc/VscCaseSensitive';
import {VscRegex} from '@react-icons/all-files/vsc/VscRegex';
import {VscWholeWord} from '@react-icons/all-files/vsc/VscWholeWord';
import clsx from 'clsx';

type SearchButtonColors = {
  foregroundColor: string;
  selectionColor: string;
  backgroundColor: string;
};

type SearchButtonProps = React.PropsWithChildren<
  {
    onClick: () => void;
    active: boolean;
    title: string;
  } & SearchButtonColors
>;

const SearchButton = ({
  onClick,
  active,
  title,
  foregroundColor,
  backgroundColor,
  selectionColor,
  children
}: SearchButtonProps) => {
  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      onClick={onClick}
      className={clsx('search-button', {'search-button-active': active})}
      tabIndex={0}
      onKeyUp={handleKeyUp}
      title={title}
    >
      {children}
      <style jsx>
        {`
          .search-button {
            cursor: pointer;
            color: ${foregroundColor};
            padding: 2px;
            margin: 4px 0px;
            height: 18px;
            width: 18px;
            border-radius: 2px;
          }

          .search-button:focus {
            outline: ${selectionColor} solid 2px;
          }

          .search-button:hover {
            background-color: ${backgroundColor};
          }

          .search-button-active {
            background-color: ${selectionColor};
          }

          .search-button-active:hover {
            background-color: ${selectionColor};
          }
        `}
      </style>
    </div>
  );
};

class SearchBox extends React.PureComponent<SearchBoxProps> {
  searchTerm: string;
  input: HTMLInputElement | null = null;
  searchButtonColors: SearchButtonColors;

  constructor(props: SearchBoxProps) {
    super(props);
    this.searchTerm = '';
    this.searchButtonColors = {
      backgroundColor: this.props.borderColor,
      selectionColor: this.props.selectionColor,
      foregroundColor: this.props.foregroundColor
    };
  }

  handleChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
    this.searchTerm = event.currentTarget.value;
    if (event.shiftKey && event.key === 'Enter') {
      this.props.prev(this.searchTerm);
    } else if (event.key === 'Enter') {
      this.props.next(this.searchTerm);
    }
  };

  componentDidMount(): void {
    this.input?.focus();
  }

  render() {
    const {
      caseSensitive,
      wholeWord,
      regex,
      results,
      toggleCaseSensitive,
      toggleWholeWord,
      toggleRegex,
      next,
      prev,
      close,
      backgroundColor,
      foregroundColor,
      borderColor,
      selectionColor,
      font
    } = this.props;

    return (
      <div className="flex-row search-container">
        <div className="flex-row search-box">
          <input
            className="search-input"
            type="text"
            onKeyDown={this.handleChange}
            ref={(input) => {
              this.input = input;
            }}
            placeholder="Search"
          ></input>

          <SearchButton
            onClick={toggleCaseSensitive}
            active={caseSensitive}
            title="Match Case"
            {...this.searchButtonColors}
          >
            <VscCaseSensitive size="14px" />
          </SearchButton>

          <SearchButton
            onClick={toggleWholeWord}
            active={wholeWord}
            title="Match Whole Word"
            {...this.searchButtonColors}
          >
            <VscWholeWord size="14px" />
          </SearchButton>

          <SearchButton
            onClick={toggleRegex}
            active={regex}
            title="Use Regular Expression"
            {...this.searchButtonColors}
          >
            <VscRegex size="14px" />
          </SearchButton>
        </div>

        <span style={{minWidth: '60px', marginLeft: '4px'}}>
          {results === undefined
            ? ''
            : results.resultCount === 0
            ? 'No results'
            : `${results.resultIndex + 1} of ${results.resultCount}`}
        </span>

        <div className="flex-row">
          <SearchButton
            onClick={() => prev(this.searchTerm)}
            active={false}
            title="Previous Match"
            {...this.searchButtonColors}
          >
            <VscArrowUp size="14px" />
          </SearchButton>

          <SearchButton
            onClick={() => next(this.searchTerm)}
            active={false}
            title="Next Match"
            {...this.searchButtonColors}
          >
            <VscArrowDown size="14px" />
          </SearchButton>

          <SearchButton onClick={() => close()} active={false} title="Close" {...this.searchButtonColors}>
            <VscClose size="14px" />
          </SearchButton>
        </div>

        <style jsx>
          {`
            .search-container {
              background-color: ${backgroundColor};
              border: 1px solid ${borderColor};
              border-radius: 2px;
              position: absolute;
              right: 13px;
              top: 4px;
              z-index: 10;
              padding: 4px;
              font-family: ${font};
              font-size: 12px;
            }

            .search-input {
              outline: none;
              background-color: transparent;
              border: none;
              color: ${foregroundColor};
              align-self: stretch;
              width: 100px;
            }

            .flex-row {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              gap: 4px;
            }

            .search-box {
              border: none;
              border-radius: 2px;
              outline: ${borderColor} solid 1px;
              background-color: ${backgroundColor};
              color: ${foregroundColor};
              padding: 0px 4px;
            }

            .search-input::placeholder {
              color: ${foregroundColor};
            }

            .search-box:focus-within {
              outline: ${selectionColor} solid 2px;
            }
          `}
        </style>
      </div>
    );
  }
}

export default SearchBox;
