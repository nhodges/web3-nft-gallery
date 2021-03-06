import { useEffect, useState } from 'react';

import Head from 'next/head'
import Image from 'next/image'
import Header from '../../../lib/components/header'

import styles from '../../../styles/Home.module.css'

import { FEATURED_COLLECTIONS } from '../../../lib/constants/collections';
import { ABI_NFT } from '../../../lib/abi/nft';

import { ethers } from 'ethers'

export default function Collection() {

    const [collection, setCollection] = useState([])
    const [startIndex, setStartIndex] = useState(0)


    useEffect(async () => {

        const slug = window.location.pathname.split('/').pop()
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

            // get total supply
            response = await ctx.totalSupply()

            const totalSupply = parseInt(ethers.utils.formatUnits(response, 0), 10)

            response = await ctx.name()

            const collectionName = response

            console.log('>>>', totalSupply)

            const collectionData = {
                totalSupply
            }

            const nodes = []

            // console.log('>> startIndex', startIndex)

            for (let i = startIndex; i < startIndex + 3; i++) {
                try {

                    console.log('>>startIndex inside loop', startIndex, i)

                    response = await ctx.tokenURI(i)

                    const metadataUri = response.replace("ipfs://", "https://ipfs.io/ipfs/")

                    let httpResponse = await fetch('/api/proxy', {
                        method: 'POST',
                        headers: {
                            'x-proxy-uri': metadataUri,
                            'x-proxy-method': 'GET'
                        }
                        // body: JSON.stringify({a: 1, b: 'Textual content'})
                    })

                    const metadata = await httpResponse.json()

                    const node = {
                        id: i,
                        attributes: metadata.attributes,
                        image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                        uri: `/collection/${slug}/${i}`
                    }

                    node.name = `${collectionName} #${i}`

                    nodes.push(node)
                } catch (e) {
                    console.log('e', e)
                }
            }



            setCollection({
                collectionName,
                nodes
            })

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

                <p className={styles.description}>
                    {collection.collectionName}{' '}
                    <code className={styles.code}>collection</code>
                </p>

                <div>
                    <button className={styles.button} onClick={() => { setStartIndex(startIndex + 3); }}>Next Page</button>
                </div>

                <div key={startIndex} className={styles.grid}>
                    {collection && collection.nodes && collection.nodes.map(node => {
                        console.log('node id', node.id)
                        console.log(node.attributes)
                        return (
                            <a key={node.id} href={node.uri} className={styles.card}>
                                <h2>{node.name} &rarr;</h2>
                                <img src={node.image} />
                                {node.attributes.length > 0 && node.attributes.map(attribute => {
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
