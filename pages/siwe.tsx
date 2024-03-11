import { getCsrfToken, signIn, useSession } from "next-auth/react"
import { SiweMessage } from "siwe"
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi"
import Layout from "../components/layout"
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useEffect, useState } from "react"

function Siwe() {
  const { signMessageAsync } = useSignMessage()
  const { chain } = useNetwork()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { data: session, status } = useSession()

  const handleLogin = async () => {
    try {
      const callbackUrl = "/protected"
      console.log('window.location.host', window.location.host);
      console.log('window.location.origin', window.location.origin);
      const message = new SiweMessage({
        domain: 'https://opensea.io',
        // domain: 'opensea.io',
        address: address,
        statement: "Sign in with Ethereum to the app.",
        // uri: window.location.origin,
        uri: 'https://opensea.io',
        version: "1",
        chainId: chain?.id,
        nonce: '12345678',
        issuedAt: '2024-03-10T01:08:50.113Z'
      })
      console.log('message.prepareMessage()', message.prepareMessage());

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      })
      console.log('signature', signature);

      signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      })
    } catch (error) {
      window.alert(error)
    }
  }

  useEffect(() => {
    console.log(isConnected);
    if (isConnected && !session) {
      handleLogin()
    }
  }, [isConnected])

  return (
    <Layout>
      <button
        onClick={(e) => {
          e.preventDefault()
          if (!isConnected) {
            connect()
          } else {
            handleLogin()
          }
        }}
      >
        Sign-in
      </button>
    </Layout>
  )
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  }
}

Siwe.Layout = Layout

export default Siwe