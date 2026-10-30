import {ImageResponse} from 'next/og';
export const alt='CodeSquad — Engineering & Agriculture';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{background:'#f6f5ee',width:'100%',height:'100%',display:'flex',flexDirection:'column',padding:80,color:'#202b26'}}><div style={{fontSize:32}}>codesquad. / ENGINEERING & AGRICULTURE</div><div style={{fontSize:88,lineHeight:1.1,marginTop:80}}>Engineering and agriculture, built to work.</div><div style={{fontSize:26,marginTop:50,color:'#526d30'}}>Software. Automation. Data systems.</div></div>,size)}
