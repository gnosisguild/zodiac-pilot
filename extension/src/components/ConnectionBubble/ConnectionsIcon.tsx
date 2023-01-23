import React from 'react'

interface ConnectionsIconProps {
  width?: string
  height?: string
}

const ConnectionsIcon: React.FC<ConnectionsIconProps> = ({
  width = '49',
  height = '36',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 49 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.0927 23.8212C19.7639 23.5698 19.4786 23.2635 19.2493 22.9158L19.2497 22.917C18.7257 22.1434 18.4874 21.2091 18.5783 20.2845C18.6292 19.7766 18.7737 19.2988 19.0122 18.8524L20.304 16.4468L21.2527 16.9892L20.7582 17.9622L19.9709 19.4004C19.8026 19.714 19.6979 20.06 19.6628 20.4182L19.6616 20.4185C19.6217 20.7822 19.655 21.1519 19.7596 21.5051C19.8641 21.8583 20.0377 22.1875 20.2697 22.4726C20.4987 22.7558 20.7682 22.984 21.0747 23.1541C21.3786 23.3329 21.7072 23.4466 22.0608 23.4965C22.4179 23.548 22.7798 23.5249 23.1248 23.4284C23.4697 23.332 23.7902 23.1642 24.0666 22.9355C24.3406 22.7137 24.596 22.3841 24.7625 22.0696L26.0258 19.7173L26.9741 20.2605L25.6927 22.6711C25.4582 23.1135 25.1388 23.5021 24.7532 23.8142C24.0449 24.386 23.1536 24.6745 22.2416 24.6272C21.8348 24.6109 21.4323 24.5237 21.0515 24.3692L11.4955 42.0297L10.546 41.487L20.0927 23.8212ZM26.0258 19.7173L25.0729 19.1735L25.0765 19.1666L22.2098 17.529L22.2069 17.5347L21.2527 16.9892L20.304 16.4468L21.5851 14.0349C21.8247 13.5882 22.14 13.207 22.5332 12.8907C22.9218 12.5757 23.357 12.3504 23.8385 12.2135C24.2323 12.1015 24.6344 12.0532 25.0424 12.0691C25.4474 12.0925 25.8421 12.1821 26.2275 12.3365L35.4795 -4.58046L36.4275 -4.03859L27.1851 12.8848C27.5177 13.1399 27.8011 13.438 28.0358 13.7802C28.266 14.1291 28.4404 14.5069 28.5584 14.9114C28.7018 15.4 28.749 15.9109 28.6974 16.4142C28.6504 16.9208 28.5035 17.4104 28.2656 17.8536L26.9749 20.2589L26.0258 19.7173ZM24.1483 13.2798C23.8085 13.375 23.4921 13.5385 23.2173 13.7609C22.9417 13.9865 22.713 14.2657 22.5438 14.583L21.7712 16.0296L26.5342 18.7522L27.3068 17.3055C27.4775 16.9907 27.5842 16.6428 27.6207 16.2825C27.6572 15.9222 27.6227 15.5564 27.5194 15.2068C27.4172 14.849 27.2454 14.5146 27.0143 14.2237C26.791 13.9454 26.52 13.7106 26.2151 13.5313C25.906 13.3591 25.5696 13.2463 25.2228 13.1986C24.8636 13.1517 24.5053 13.1783 24.1483 13.2798Z"
      fill="white"
    />
    <path
      d="M30.413 29.5965C30.0843 29.3452 29.7989 29.0389 29.5697 28.6911L29.57 28.6924C29.0461 27.9188 28.8077 26.9845 28.8986 26.0599C28.9495 25.552 29.094 25.0742 29.3325 24.6278L30.6243 22.2222L31.573 22.7646L31.0785 23.7376L30.2913 25.1758C30.1229 25.4894 30.0182 25.8354 29.9831 26.1936L29.9819 26.1939C29.942 26.5576 29.9753 26.9273 30.0799 27.2805C30.1844 27.6337 30.358 27.9629 30.59 28.248C30.819 28.5312 31.0885 28.7594 31.395 28.9295C31.6989 29.1083 32.0275 29.222 32.3811 29.2719C32.7382 29.3234 33.1002 29.3003 33.4451 29.2038C33.79 29.1074 34.1105 28.9396 34.387 28.7108C34.6609 28.4891 34.9163 28.1595 35.0828 27.845L36.3461 25.4927L37.2944 26.0359L36.013 28.4465C35.7785 28.8889 35.4591 29.2775 35.0735 29.5896C34.3652 30.1614 33.4739 30.4499 32.5619 30.4026C32.1551 30.3863 31.7526 30.2991 31.3718 30.1446L21.8158 47.8051L20.8663 47.2623L30.413 29.5965ZM36.3461 25.4927L35.3933 24.9489L35.3968 24.942L32.5301 23.3044L32.5272 23.3101L31.573 22.7646L30.6243 22.2222L31.9054 19.8103C32.145 19.3635 32.4603 18.9823 32.8535 18.666C33.2421 18.3511 33.6773 18.1258 34.1588 17.9889C34.5526 17.8769 34.9547 17.8286 35.3627 17.8445C35.7677 17.8679 36.1624 17.9575 36.5478 18.1118L45.7999 1.19493L46.7478 1.7368L37.5054 18.6602C37.838 18.9153 38.1214 19.2134 38.3561 19.5556C38.5863 19.9044 38.7607 20.2823 38.8787 20.6868C39.0221 21.1754 39.0693 21.6863 39.0177 22.1895C38.9707 22.6962 38.8238 23.1858 38.5859 23.629L37.2953 26.0342L36.3461 25.4927ZM34.4686 19.0552C34.1288 19.1504 33.8124 19.3139 33.5376 19.5363C33.262 19.7619 33.0333 20.0411 32.8642 20.3584L32.0915 21.805L36.8545 24.5276L37.6272 23.0809C37.7978 22.7661 37.9045 22.4182 37.941 22.0579C37.9775 21.6975 37.9431 21.3318 37.8397 20.9822C37.7375 20.6244 37.5657 20.2899 37.3346 19.9991C37.1113 19.7208 36.8404 19.486 36.5354 19.3067C36.2263 19.1345 35.8899 19.0217 35.5431 18.974C35.1839 18.9271 34.8256 18.9537 34.4686 19.0552Z"
      fill="white"
    />
    <path
      d="M9.62785 17.7176C9.29909 17.4662 9.01377 17.16 8.7845 16.8122L8.78485 16.8135C8.2609 16.0399 8.02259 15.1056 8.11342 14.181C8.16438 13.6731 8.30889 13.1953 8.54733 12.7489L9.83919 10.3433L10.7878 10.8857L10.2933 11.8586L9.5061 13.2969C9.33775 13.6105 9.23305 13.9565 9.19794 14.3146L9.19676 14.315C9.15683 14.6787 9.19016 15.0484 9.29471 15.4016C9.39927 15.7548 9.57286 16.084 9.80484 16.3691C10.0339 16.6523 10.3033 16.8805 10.6099 17.0506C10.9138 17.2294 11.2423 17.3431 11.596 17.393C11.953 17.4445 12.315 17.4214 12.66 17.3249C13.0048 17.2285 13.3253 17.0607 13.6018 16.8319C13.8758 16.6102 14.1312 16.2806 14.2976 15.9661L15.5609 13.6138L16.5093 14.157L15.2279 16.5676C14.9933 17.01 14.674 17.3986 14.2884 17.7107C13.5801 18.2825 12.6887 18.571 11.7768 18.5237C11.37 18.5074 10.9674 18.4201 10.5866 18.2657L1.03069 35.9262L0.0811733 35.3834L9.62785 17.7176ZM15.5609 13.6138L14.6081 13.07L14.6117 13.0631L11.745 11.4255L11.742 11.4312L10.7878 10.8857L9.83919 10.3433L11.1202 7.93141C11.3599 7.48464 11.6751 7.10344 12.0684 6.78714C12.4569 6.47219 12.8921 6.24687 13.3737 6.10997C13.7675 5.99802 14.1695 5.94968 14.5775 5.96562C14.9825 5.98901 15.3773 6.07863 15.7627 6.23294L25.0147 -10.684L25.9627 -10.1421L16.7203 6.78131C17.0528 7.03639 17.3363 7.33445 17.571 7.67671C17.8011 8.02554 17.9756 8.4034 18.0935 8.80788C18.2369 9.29651 18.2842 9.80737 18.2325 10.3106C18.1855 10.8173 18.0387 11.3069 17.8008 11.7501L16.5101 14.1553L15.5609 13.6138ZM13.6834 7.17632C13.3437 7.2715 13.0272 7.43499 12.7525 7.65735C12.4769 7.88302 12.2482 8.16221 12.079 8.47945L11.3064 9.92606L16.0694 12.6487L16.842 11.202C17.0127 10.8872 17.1194 10.5393 17.1559 10.179C17.1924 9.81864 17.1579 9.45287 17.0545 9.10327C16.9523 8.74549 16.7805 8.41104 16.5494 8.12017C16.3262 7.84185 16.0552 7.60709 15.7502 7.42782C15.4412 7.25559 15.1047 7.14279 14.7579 7.09512C14.3987 7.04816 14.0404 7.07482 13.6834 7.17632Z"
      fill="white"
    />
  </svg>
)

export default ConnectionsIcon