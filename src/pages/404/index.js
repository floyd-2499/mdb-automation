import React from "react";
import Pic404 from "../../view/assets/Error404.svg";
import styles from "./styles.module.scss";
import Link from "next/link";
import uris from "@/config/uris/uris";
import Image from "next/image";

const Page404 = () => {
    return (
        <Link className={styles["error-page-container"]} href={uris.home}>
            <Image src={Pic404} alt="404 Error" className={styles['error-pic-404']} />
        </Link>
    );
}

export default Page404;
