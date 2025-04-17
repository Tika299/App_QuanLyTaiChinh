import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import Header from './Header';
import Slider from './Slider';

function Transaction() {
    return (
        <div className="d-flex">
            {<Slider />}
            <div className='wapper'>
                {<Header />}
                <main className='d-flex'>
                    <div className='content'>

                    </div>
                </main>
            </div>
        </div>
    )
}

export default Transaction;