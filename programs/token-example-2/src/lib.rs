use anchor_lang::prelude::*;

declare_id!("2DZByGxr4wvH2zYEJREnGSoy4hvoC3FpFNvswpXC7WjX");

mod instructions;
use instructions::*;

#[program]
pub mod token_example_2 {
    use super::*;

    pub fn initialize(ctx: Context<InitializeContext>, fee_bps: u16, max_fee: u64) -> Result<()> {
        _initialize(ctx, fee_bps, max_fee)
    }
    pub fn mint(ctx: Context<MintContext>, amount: u64) -> Result<()> {
        _mint(ctx, amount)
    }
    pub fn transfer(ctx: Context<TransferContext>, amount: u64) -> Result<()> {
        _transfer(ctx, amount)
    }
    pub fn withdraw(ctx: Context<WithdrawContext>) -> Result<()> {
        _withdraw(ctx)
    }
}
