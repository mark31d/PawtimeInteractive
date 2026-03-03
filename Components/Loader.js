// File: Components/Loader.js
import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { IMAGES } from './AssetRegistry';

const SPINNER_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;background:transparent;display:flex;align-items:center;justify-content:center;}
.spinner {
  position: absolute;
  width: 25px;
  height: 40px;
}
.spinner div {
  position: absolute;
  width: 50%;
  height: 150%;
  background: transparent;
  transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1%));
  animation: spinner-fzua35 2.5s calc(var(--delay) * 0.5s) infinite ease;
  color: #6B2E00;
  text-align: end;
  font-weight: 700;
  font-size: 20px;
}
.spinner div:nth-child(1)  { --delay: 0.1; --rotation: 45;  --translation: 150; }
.spinner div:nth-child(2)  { --delay: 0.2; --rotation: 90;  --translation: 150; }
.spinner div:nth-child(3)  { --delay: 0.3; --rotation: 135; --translation: 150; }
.spinner div:nth-child(4)  { --delay: 0.4; --rotation: 180; --translation: 150; }
.spinner div:nth-child(5)  { --delay: 0.5; --rotation: 225; --translation: 150; }
.spinner div:nth-child(6)  { --delay: 0.6; --rotation: 270; --translation: 150; }
.spinner div:nth-child(7)  { --delay: 0.7; --rotation: 315; --translation: 150; }
.spinner div:nth-child(8)  { --delay: 0.8; --rotation: 360; --translation: 150; }
div.icon-1, div.icon-2 { background: transparent; }
.icon-1 svg { transform: rotate(180deg); position: relative; left: -15px; }
.icon-2 svg { position: relative; left: -15px; }
@keyframes spinner-fzua35 {
  0%,10%,20%,30%,50%,60%,70%,80%,90%,100% {
    transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1%));
  }
  50% {
    transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1.5%));
  }
}
</style>
</head>
<body>
<div class="spinner">
  <div>C</div>
  <div>A</div>
  <div>T</div>
  <div class="icon-1">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 50 49" height="49" width="40">
      <path fill="#8B0000" d="M12.376 0.00166752C13.3938 -0.0161892 14.3938 0.110593 15.3402 0.323088C15.619 0.385826 15.8783 0.515842 16.0954 0.701795C16.3124 0.887749 16.4807 1.12399 16.5855 1.38991C16.6902 1.65583 16.7284 1.94335 16.6965 2.22739C16.6646 2.51143 16.5638 2.78335 16.4027 3.01945C16.3991 3.0248 16.3937 3.03016 16.3937 3.03909C15.983 3.66407 15.2331 3.96764 14.5009 3.80693C13.8581 3.64622 13.1795 3.57479 12.501 3.57479C7.42968 3.57479 3.32264 7.82468 3.5905 12.9495C3.70172 15.0895 4.57963 17.1179 6.06364 18.6637L5.99222 18.7994C7.07605 17.3944 8.46806 16.257 10.0609 15.4749C11.6538 14.6929 13.405 14.2871 15.1795 14.2888C16.9294 14.2888 18.6794 14.6816 20.2508 15.4495L28.7684 19.5922C29.5005 19.9494 30.3398 19.4137 30.3398 18.6101V16.2352C30.3398 14.0031 31.1791 11.9674 32.554 10.4139L39.786 2.36054C40.2324 1.86055 41.0717 2.16411 41.0717 2.84267V7.68183C44.4109 8.44966 47.0358 11.8246 47.7143 15.3066C47.8036 15.753 48.1965 16.0745 48.6429 16.0745C49.0028 16.0745 49.348 16.2174 49.6025 16.472C49.857 16.7265 50 17.0716 50 17.4316V17.8244C50 21.7886 46.7858 25.0028 42.8216 25.0028V27.842C42.8221 29.7979 42.0946 31.684 40.7809 33.133C39.4672 34.5821 37.6612 35.4904 35.7147 35.6811V47.5558C35.7147 47.9129 35.4111 48.2165 35.0361 48.2165H31.0184C30.6434 48.2165 30.3398 47.9129 30.3398 47.5379V37.04L27.8399 47.5379C27.7327 47.9308 27.3756 48.2165 26.9649 48.2165H23.1614C22.7329 48.2165 22.4114 47.8058 22.5186 47.4129L25.2989 35.7168H18.1312L20.9115 47.4129C21.0186 47.8058 20.6972 48.2165 20.2686 48.2165H16.4652C16.0545 48.2165 15.6973 47.9308 15.5902 47.5379L13.5009 38.7703L11.8046 40.4667C11.4296 40.8417 11.3224 41.3952 11.5367 41.8774L13.8581 47.2879C14.0724 47.7165 13.7509 48.2165 13.2688 48.2165H9.37606C9.10821 48.2165 8.85822 48.0558 8.76893 47.8058L4.26905 37.2882C3.80478 36.2525 3.57264 35.1275 3.57264 34.0026V25.8956C3.57264 24.4957 3.82085 23.1546 4.27441 21.9118C2.90905 20.7192 1.81961 19.2438 1.08171 17.5879C0.343819 15.9321 -0.0248528 14.1354 0.00130081 12.3228C0.0905838 5.57295 5.62616 0.0730942 12.376 0.00166752ZM43.1912 15.6209C43.1912 14.9799 42.6734 14.4834 42.0538 14.4834C41.4127 14.4834 40.9163 15.0013 40.9163 15.6209V17.3173C40.9186 17.6182 41.0392 17.9062 41.252 18.119C41.4649 18.3318 41.7528 18.4524 42.0538 18.4548C42.2033 18.4552 42.3514 18.4261 42.4896 18.3691C42.6278 18.3121 42.7534 18.2284 42.8591 18.1227C42.9649 18.0169 43.0486 17.8914 43.1056 17.7531C43.1626 17.6149 43.1917 17.4668 43.1912 17.3173V15.6209Z"/>
    </svg>
  </div>
  <div>C</div>
  <div>A</div>
  <div>T</div>
  <div class="icon-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 50 49" height="49" width="40">
      <path fill="#8B0000" d="M12.376 0.00166752C13.3938 -0.0161892 14.3938 0.110593 15.3402 0.323088C15.619 0.385826 15.8783 0.515842 16.0954 0.701795C16.3124 0.887749 16.4807 1.12399 16.5855 1.38991C16.6902 1.65583 16.7284 1.94335 16.6965 2.22739C16.6646 2.51143 16.5638 2.78335 16.4027 3.01945C16.3991 3.0248 16.3937 3.03016 16.3937 3.03909C15.983 3.66407 15.2331 3.96764 14.5009 3.80693C13.8581 3.64622 13.1795 3.57479 12.501 3.57479C7.42968 3.57479 3.32264 7.82468 3.5905 12.9495C3.70172 15.0895 4.57963 17.1179 6.06364 18.6637L5.99222 18.7994C7.07605 17.3944 8.46806 16.257 10.0609 15.4749C11.6538 14.6929 13.405 14.2871 15.1795 14.2888C16.9294 14.2888 18.6794 14.6816 20.2508 15.4495L28.7684 19.5922C29.5005 19.9494 30.3398 19.4137 30.3398 18.6101V16.2352C30.3398 14.0031 31.1791 11.9674 32.554 10.4139L39.786 2.36054C40.2324 1.86055 41.0717 2.16411 41.0717 2.84267V7.68183C44.4109 8.44966 47.0358 11.8246 47.7143 15.3066C47.8036 15.753 48.1965 16.0745 48.6429 16.0745C49.0028 16.0745 49.348 16.2174 49.6025 16.472C49.857 16.7265 50 17.0716 50 17.4316V17.8244C50 21.7886 46.7858 25.0028 42.8216 25.0028V27.842C42.8221 29.7979 42.0946 31.684 40.7809 33.133C39.4672 34.5821 37.6612 35.4904 35.7147 35.6811V47.5558C35.7147 47.9129 35.4111 48.2165 35.0361 48.2165H31.0184C30.6434 48.2165 30.3398 47.9129 30.3398 47.5379V37.04L27.8399 47.5379C27.7327 47.9308 27.3756 48.2165 26.9649 48.2165H23.1614C22.7329 48.2165 22.4114 47.8058 22.5186 47.4129L25.2989 35.7168H18.1312L20.9115 47.4129C21.0186 47.8058 20.6972 48.2165 20.2686 48.2165H16.4652C16.0545 48.2165 15.6973 47.9308 15.5902 47.5379L13.5009 38.7703L11.8046 40.4667C11.4296 40.8417 11.3224 41.3952 11.5367 41.8774L13.8581 47.2879C14.0724 47.7165 13.7509 48.2165 13.2688 48.2165H9.37606C9.10821 48.2165 8.85822 48.0558 8.76893 47.8058L4.26905 37.2882C3.80478 36.2525 3.57264 35.1275 3.57264 34.0026V25.8956C3.57264 24.4957 3.82085 23.1546 4.27441 21.9118C2.90905 20.7192 1.81961 19.2438 1.08171 17.5879C0.343819 15.9321 -0.0248528 14.1354 0.00130081 12.3228C0.0905838 5.57295 5.62616 0.0730942 12.376 0.00166752ZM43.1912 15.6209C43.1912 14.9799 42.6734 14.4834 42.0538 14.4834C41.4127 14.4834 40.9163 15.0013 40.9163 15.6209V17.3173C40.9186 17.6182 41.0392 17.9062 41.252 18.119C41.4649 18.3318 41.7528 18.4524 42.0538 18.4548C42.2033 18.4552 42.3514 18.4261 42.4896 18.3691C42.6278 18.3121 42.7534 18.2284 42.8591 18.1227C42.9649 18.0169 43.0486 17.8914 43.1056 17.7531C43.1626 17.6149 43.1917 17.4668 43.1912 17.3173V15.6209Z"/>
    </svg>
  </div>
</div>
</body>
</html>`;

export default function Loader({ spinnerDuration = 8000, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => {
      if (onDone) { onDone(); }
    }, spinnerDuration);
    return () => clearTimeout(t);
  }, [spinnerDuration, onDone]);

  return (
    <ImageBackground source={IMAGES.bg} style={StyleSheet.absoluteFillObject} resizeMode="cover">
      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <Image
            source={IMAGES.logo}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>PLAYТALECAT</Text>
        <Text style={styles.subtitle}>FOR ALL YOUR CAT NEEDS</Text>
        <View style={styles.spinnerWrap}>
          <WebView
            source={{ html: SPINNER_HTML }}
            style={styles.webview}
            scrollEnabled={false}
            backgroundColor="transparent"
            opaque={false}
            javaScriptEnabled
            originWhitelist={['*']}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    marginBottom: 28,
  },
  logo: {
    width: 110,
    height: 110,
    opacity: 0.9,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 7,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 3,
    marginTop: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  spinnerWrap: {
    width: 300,
    height: 300,
    marginTop: 24,
  },
  webview: {
    width: 300,
    height: 300,
    backgroundColor: 'transparent',
  },
});
