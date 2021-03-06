import { useEffect, useReducer, useState } from 'react';

import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Header from '../lib/components/header'

import { ethers } from 'ethers'

const simplified_abi = [
  {
    'inputs': [{ 'internalType': 'address', 'name': 'owner', 'type': 'address' }],
    'name': 'balanceOf',
    'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }],
    'payable': false, 'stateMutability': 'view', 'type': 'function', 'constant': true
  },
  {
    'inputs': [],
    'name': 'name',
    'outputs': [{ 'internalType': 'string', 'name': '', 'type': 'string' }],
    'stateMutability': 'view', 'type': 'function', 'constant': true
  },
  {
    'inputs': [{ 'internalType': 'uint256', 'name': 'tokenId', 'type': 'uint256' }],
    'name': 'ownerOf',
    'outputs': [{ 'internalType': 'address', 'name': '', 'type': 'address' }],
    'payable': false, 'stateMutability': 'view', 'type': 'function', 'constant': true
  },
  {
    'inputs': [],
    'name': 'symbol',
    'outputs': [{ 'internalType': 'string', 'name': '', 'type': 'string' }],
    'stateMutability': 'view', 'type': 'function', 'constant': true
  },
  {
    'inputs': [],
    'name': 'totalSupply',
    'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }],
    'stateMutability': 'view', 'type': 'function', 'constant': true
  },
]

const contractABI = [
  "function tokenURI(uint256 _tokenId) external view returns (string memory)",
];

export default function Home() {

  const [collection, setCollection] = useState([])
  const [startIndex, setStartIndex] = useState(0)


  useEffect(async () => {

    console.log('load')

    if (typeof window !== 'undefined') {
      let provider
      let signer
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.enable()
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

      }
        let abi = simplified_abi
        let ctx = new ethers.Contract("0x60e4d786628fea6478f785a6d7e704777c86a7c6", abi, signer)

        let response;

        // get total supply
        response = await ctx.totalSupply()

        const totalSupply = parseInt(ethers.utils.formatUnits(response, 0), 10)

        console.log('>>>', totalSupply)

        const collectionData = {
          totalSupply
        }

        const nodes = []

        // console.log('>> startIndex', startIndex)

        for(let i = startIndex; i < startIndex + 3; i++) {
          console.log('>>startIndex inside loop', startIndex, i)
          let ctx2 = new ethers.Contract("0x60e4d786628fea6478f785a6d7e704777c86a7c6", contractABI, signer)


          response = await ctx2.tokenURI(i)
  
          const metadataUri = response
  
          let httpResponse = await fetch(metadataUri, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
            // body: JSON.stringify({a: 1, b: 'Textual content'})
          })
  
          const metadata = await httpResponse.json()
  
          const node = {
            id: i,
            attributes: metadata.attributes,
            image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
          }

          nodes.push(node)
        }

        

        setCollection(nodes)

        // await internals.fetchStakingBalance(setStakingBalance, setTotalCollateral)
        // window.location.hash = ''
      }


  }, [startIndex])
  
  // todo:
  // - detect https://medium.com/knownorigin/eip-2981-simple-and-effective-royalty-standards-for-all-dbd0b761a0f0

  return (
    <div className={styles.container}>
      <Head>
        <title>NFT Explorer</title>
        <meta name="description" content="NFT Explorer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Header />

        <h3><a href="/collection/bored-ape-yacht-club">Bored Ape Yacht Club</a></h3>

        <h3><a href="/collection/mutant-ape-yacht-club">Mutant Ape Yacht Club</a></h3>

        <h3><a href="/collection/fidenza-by-tyler-hobbs">Fidenza</a></h3>

        {/* <div>
          <button onClick={() => { setStartIndex(startIndex + 3); }}>Next Page</button>
        </div>

        <div key={startIndex} className={styles.grid}>
          {collection && collection.map(node => {
            console.log('node id', node.id)
            console.log(node.attributes)
            return (
              <a key={node.id} href="#" className={styles.card}>
                <h2>Mutant Ape Yacht Club #{node.id} &rarr;</h2>
                <img src={node.image} />
                {node.attributes.length > 0 && node.attributes.map(attribute => {
                  return (
                    <div key={`${attribute.trait_type}`}>{attribute.trait_type}: {attribute.value}</div>
                  )
                })}
              </a>
            )
          })}
        </div> */}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
