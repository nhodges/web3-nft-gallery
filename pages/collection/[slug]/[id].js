import { useEffect, useState } from 'react';

import Head from 'next/head'
import Image from 'next/image'

import Header from '../../../lib/components/header'
import styles from '../../../styles/Home.module.css'
import { FEATURED_COLLECTIONS } from '../../../lib/constants/collections';
import { ABI_NFT } from '../../../lib/abi/nft';

import { ethers } from 'ethers'

export default function Collection() {

    const [token, setToken] = useState(false)

    useEffect(async () => {

        const path = window.location.pathname.split('/')
        const slug = path[path.length - 2]
        const id = path[path.length - 1]
        const collectionAddress = FEATURED_COLLECTIONS[slug] || slug

        if (typeof window !== 'undefined') {

            let provider
            let signer

            if (typeof window.ethereum !== 'undefined') {
                window.ethereum.enable()
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();

            }

            let ctx = new ethers.Contract(collectionAddress, ABI_NFT, signer)

            let response;

            response = await ctx.tokenURI(id)

            const metadataUri = response.replace("ipfs://", "https://ipfs.io/ipfs/")

            let httpResponse = await fetch('/api/proxy', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'mode': 'cors',
                    'x-proxy-uri': metadataUri,
                    'x-proxy-method': 'GET'
                }
                // body: JSON.stringify({a: 1, b: 'Textual content'})
            })

            const metadata = await httpResponse.json()

            response = await ctx.ownerOf(id)

            const node = {
                id: id,
                attributes: metadata.attributes,
                image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                owner: response
            }


            response = await ctx.name()
            node.collectionName = response

            console.log('>>> node', node)

            setToken(node)

            // await internals.fetchStakingBalance(setStakingBalance, setTotalCollateral)
            // window.location.hash = ''
        }

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
                <Header />

                <p className={styles.description}>
                    {token.collectionName}{' '}
                    <code className={styles.code}>token</code>
                </p>

                <div className={styles.grid}>
                    {token && (
                        <a key={token.id} href={`/wallet/${token.owner}`} className={styles.card}>
                            <h2>{token.collectionName} #{token.id} &rarr;</h2>
                            <img src={token.image} />
                            {token.attributes.length > 0 && token.attributes.map(attribute => {
                                return (
                                    <div key={`${attribute.trait_type}`}>{attribute.trait_type}: {attribute.value}</div>
                                )
                            })}
                            {/* <p><pre>{JSON.stringify(node, 1, 2)}</pre></p> */}
                        </a>
                    )}
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
