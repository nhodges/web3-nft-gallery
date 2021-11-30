import { useEffect, useState } from 'react';

import Head from 'next/head'
import Image from 'next/image'

import styles from '../../styles/Home.module.css'

import { ethers } from 'ethers'

const contractABI = [
    "function tokenURI(uint256 _tokenId) external view returns (string memory)",
];

export default function Collection() {

    const [tokens, setTokens] = useState([])

    useEffect(async () => {

        const path = window.location.pathname.split('/')
        const slug = path[path.length - 1]
        const api = `https://api.opensea.io/api/v1/assets?owner=${slug}`

        let httpResponse = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'x-proxy-uri': api,
                'x-proxy-method': 'GET'
            }
            // body: JSON.stringify({a: 1, b: 'Textual content'})
        })

        const responseJson = await httpResponse.json()

        setTokens(responseJson.assets)

    }, [])

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
                <h1 className={styles.title}>
                    Welcome to <a href="https://nextjs.org">Next.js!</a>
                </h1>

                <p className={styles.description}>
                    Get started by editing{' '}
                    <code className={styles.code}>pages/index.js</code>
                </p>

                <div className={styles.grid}>
                    {tokens && tokens.map(node => {
                        return (
                            <a key={node.token_id} href={`/collection/${node.asset_contract.address}`} className={styles.card}>
                                <h2>{node.asset_contract.name} #{node.token_id} &rarr;</h2>
                                <img src={node.image_original_url} />
                                {node.traits.length > 0 && node.traits.map(attribute => {
                                    return (
                                        <div key={`${attribute.trait_type}`}>{attribute.trait_type}: {attribute.value}</div>
                                    )
                                })}
                                {/* <p><pre>{JSON.stringify(node, 1, 2)}</pre></p> */}
                            </a>
                        )
                    })}
                </div>
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
